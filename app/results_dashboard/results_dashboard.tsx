"use client";
import SearchResults from '../search_results/search_results'
import styles from '../index.module.css'
import { useState } from 'react';
import { Search, SearchResult } from '../types';
import { RAGResponse } from '../../utils';
// import LLMResponse from '../llm_response/llm_response';
import LLMResponse from '../llm_modal/llm_modal';

import { Button } from 'react-bootstrap';


interface ResultsDashboardProps {
    query: string;
    blue_search_results: any; // Replace 'any' with the appropriate type if known
    red_search_results: any; // Replace 'any' with the appropriate type if known
}

export default function ResultsDashboard({ query, blue_search_results, red_search_results }: ResultsDashboardProps) {
    // display "back to search" button and loading screen or RagResults component"
    // i don't want the biased results
    // when this is created kick off Rag result 
    const [completion, setCompletion] = useState("");
    const [triggeredRag, setTriggeredRag] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const handleClose = () => setShowModal(false);


    async function fetchData() {
        setTriggeredRag(true);
        const message = await RAGResponse(query, blue_search_results, red_search_results);
        if (message) setCompletion(message);
    }

    const formattedResults = formatSearches(blue_search_results, red_search_results);
    return (
        <div className={styles.results_container}>
            <div>
                <LLMResponse
                    showModal={showModal}
                    handleClose={handleClose}
                    response={completion}
                />
            </div>
            <SearchResults results={formattedResults} />
            <div>
                {!triggeredRag && <Button variant="light" data-bs-toggle="popover" onClick={fetchData}>Analyze Bias </Button>}
                {triggeredRag && !completion && <h3> ⏳ Loading LLM response...</h3>}
                {completion && <Button variant="light" onClick={() => setShowModal(true)}>Bias Evaluation</Button>}
            </div>
        </div>

    );


}


function formatSearches(
    blue_search: Search,
    red_search: Search):
    SearchResult[] {
    const results: SearchResult[] = [];

    // Handle single response objects
    if (blue_search.results) {
        for (const result of blue_search.results) {
            results.push({
                title: result.title,
                text: result.text,
                url: result.url,
                highlights: result.highlights ?? []
            });
        }
    }


    if (red_search.results) {
        for (const result of red_search.results) {
            results.push({
                title: result.title,
                text: result.text,
                url: result.url,
                highlights: result.highlights ?? []
            });
        }
    }

    return results;
}