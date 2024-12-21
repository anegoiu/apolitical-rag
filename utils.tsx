'use server';

import tokenizer from 'gpt-tokenizer';
import Exa from 'exa-js';
import OpenAI from "openai";
// import { Article } from './experiments/types';
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {SearchResult, Search} from './app/types'


console.log(process.env.OPENAI_API_KEY)
const openai = new OpenAI();
const exa = new Exa(process.env.EXA_API_KEY);

function log_tokens(messages: ChatCompletionMessageParam[]) {
    let totalTokens = 0;
    messages.forEach((msg: ChatCompletionMessageParam) => {
        const tokens = tokenizer.encode(msg.content as string);
        totalTokens += tokens.length;
    });

    console.log(`Total tokens: ${totalTokens}`);
}

async function exa_search(query: string = "", numResults: number = 5) {
    /**
     * Make a search using the Exa API using the given query & settings
    */
    const search = await exa.searchAndContents(
        query,
        {
            type: "neural",
            highlights: { highlightsPerUrl: 1, numSentences: 5, query: "This is the highlight query:" },
            useAutoprompt: true,
            category: "news",
            numResults: numResults,
            text: true,
        }

    );
    return search;

}

function format_search_results_as_RAG_context(results: SearchResult[]): string {
    /**
     * Take in a result object from  the exa search and format it into a LLM ready text
     */
    let output = "";
    for (const content of results.map(res => ({ 
        title: res.title, 
        text: res.text, 
        highlights: res.highlights 
    }))) {
        output += "Title:" + content["title"] + "\n"
        if (content["highlights"]) {
            for (const highlight of content["highlights"]) {
                output += highlight + "\n"
            }


        }

        output += "\n"
        output += "-------------------\n\n"
    }

    return output
}


/**
 * 
 * Performs 2 searches: from republican and democrat perspectives
 * 
 * @param {string} query - The search query.
 * @returns {Promise<[string, Search, Search]>} - A tuple containing:
 *   - The generated response from GPT-4
 *   - The blue (democratic) search results
 *   - The red (republican) search results
 */
async function searchResults(query: string) {
    const blue_search = await exa_search(query + "I am a democrat", 10);
    const red_search = await exa_search(query + "I am a republican", 10);
    return [blue_search, red_search]
}

async function RAGResponse(
    query: string, 
    blue_search:Search, 
    red_search: Search
) {
    const blue_content = format_search_results_as_RAG_context(blue_search.results);
    const red_content = format_search_results_as_RAG_context(red_search.results);
    
    const SYSTEM_MESSAGE = "You are a helpful assistant that generates search queries based on user questions."
    
    const guiding_prompt = "Study  the differences and similarities between the democrat & republican opinions. Summarize leanings into 1-2 bullet points of bias overview. Cite your sources by referencing titles";
    const messages: ChatCompletionMessageParam[] = [
        { role: "system", content: SYSTEM_MESSAGE },
        { role: "system", content: guiding_prompt },
        { role: "user", content: query },
        { role: "system", content: "Here's a list of articles to research: \n\n Democrat:" + blue_content + "\n\n" + "Republican:" + red_content },
    ]
    log_tokens(messages)
    const completion = await openai.chat.completions.create({
        model: "gpt-4-turbo",
        messages: [
            { "role": "system", "content": guiding_prompt },
            { "role": "user", "content": query },
            { "role": "system", "content": "Here's a list of articles to research: \n\n Democrat:" + blue_content + "\n\n" + "Republican:" + red_content },
            { role: "system", content: "Please format the output as follows:\n\n1. Summary \n2. Democratic bias \n3. Republican Bias" }
        ],
    });
    return completion.choices[0].message.content
}




// // TODO: Transform to Mock Search class and rename this function  
// function format_search_results_using_XML_tags(articles:Article[]): string {
//     /**
//      * Take in a list of articles and format it into a LLM ready text
//      */
//     let output = "<articles>\n";
//     let tab_spaces = "  "
    
//     for (const article of articles) {
//         output += tab_spaces + "<article>\n"

//         tab_spaces += "  " 
//         output += tab_spaces + "<title> " + article.title + "</title> \n"
//         output += tab_spaces + "<political_affiliation> " + article.political_affiliation+ "</political_affiliation> \n"
//         output += tab_spaces + "<body> " + article.body + " </body>\n"
//         tab_spaces = tab_spaces.slice(0, -2) 

//         output += tab_spaces + "</article> \n\n"
//     }
//     output += "</articles>\n";
//     return output
// }


// /**
//  * Computes an LLM response based on the provided search results and RAG prompts.
//  * 
//  * @param {string} search_results - The search results to be included in the prompt.
//  * @param {Array<Record<string, string>>} rag_prompts - An array of RAG prompts to guide the response generation.
//  * @returns {Promise<string>} - The generated response from GPT-4.
//  */
// async function retrieveRAGresponse(
//     search_results: string, 
//     rag_prompts: ChatCompletionMessageParam[]
// ): Promise<string> {

    
//     // populate the data within the rag_prompts wth input
//     const updatedPrompts = rag_prompts.map((prompt: Record<string, string>) => {
//         if (prompt.content.includes("{{search_results}}")) {
//           return {
//             ...prompt,
//             // TODO: replace with constant
//             content: prompt.content.replace("{{search_results}}", search_results),
//           };
//         }
//         return prompt;
//       });

//     log_tokens(updatedPrompts);

  
//     const completion = await openai.chat.completions.create({
//       model: "gpt-4-turbo",
//       messages: updatedPrompts,
//     });
  
//     const messageContent = completion.choices[0]?.message?.content || "";
 
//     return messageContent;
//   }

export { log_tokens, searchResults, RAGResponse };