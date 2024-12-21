'use client';

import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import { searchResults, RAGResponse } from '../utils'
import styles from './index.module.css'
import SearchBar from "./search_bar/search_bar";
import LLMResponse from "./llm_response/llm_response";
import SearchResults from "./search_results/search_results";
import { SearchResult, Search } from './types'
import { Button } from "react-bootstrap";
import ResultsDashboard from "./results_dashboard/results_dashboard";

export default function Home() {
    const [results, setResults] = useState<SearchResult[]>([]);
    const [view, setView] = useState("search");
    const [blueSearch, setBlueSearch] = useState({});
    const [redSearch, setRedSearch] = useState({});
    const [query, setQuery] = useState("")

    const handleSearch = async (query: string) => {
        setQuery(query)
        const [blue_search, red_search] = await searchResults(query);
        setBlueSearch(blue_search)
        setRedSearch(red_search)
        const formattedResults = formatSearches(blue_search, red_search)
        setResults(formattedResults)
        setView("results")

    }

    const handleBack = () => {
        setView("search")
    }

    return (
        <div className={styles.container}>
            {
                view == "search"?
                    <SearchBar handleSearch={handleSearch} /> :
                    <div >
                        <div className={styles.search_button_container}>
                            <Button variant="light" className={styles.search_button} size='sm' onClick={handleBack}> Another search</Button>
                        </div>
                        {blueSearch && <ResultsDashboard query={query} blue_search_results={blueSearch} red_search_results={redSearch}></ResultsDashboard>}
                        
                    </div>
            }
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

