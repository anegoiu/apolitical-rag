"use client";
import { useState } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';

import styles from './search_bar.module.css'
import { Button, Dropdown } from "react-bootstrap";

interface SearchBarProps {
    handleSearch: (query: string) => Promise<void>;
}
export default function SearchBar({ handleSearch }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);

    const updateSearch = (title: string) => {
        setQuery(title_to_query[title])
    }

    const triggerSearch = async() => {
        setIsSearching(true);
        console.log("Searching...");
        await handleSearch(query);
        console.log("Done searching");
        setIsSearching(false);
    }

    return (
        <div className={styles.searchBox}>
            <h1>Apolitical Rag</h1>
            <br></br>
            <h2>Ask me about a current event or try a hand picked search</h2>
            <div className={styles.searchContainer}>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search..."
                    className={styles.input}
                />
                <Dropdown drop="end">
                    <Dropdown.Toggle className={styles.subtleButton} variant="underline-light" id="dropdown-button">
                        🔎
                    </Dropdown.Toggle>

                    <Dropdown.Menu className={styles.subtleMenu}  variant="underline-light">
                        {Object.entries(title_to_query).map(([title, queryValue]) => (
                            <Dropdown.Item
                                key={title}
                                href="#"
                                onClick={() => handleSearch(title_to_query[title])}
                            >
                                {title}
                            </Dropdown.Item>
                        ))}
                    </Dropdown.Menu>
                </Dropdown>
            </div>

            <Button
                variant={isSearching ? "secondary" : "light"}
                onClick={() => {
                    triggerSearch()
                }}
                className={styles.button}
                disabled={isSearching}
            >
                {isSearching ? "Searching..." : "Search"}
            </Button>
        </div>
    );
}

let title_to_query: Record<string, string> = {
    "China hacking calls of senior political figures ewithin the US":
        "US outlook on China hacking calls of senior political figures within the US",
    // romania election
    "trump's term": "Trump's business empire has expanded. Here's where he could profit in his second term.",
    // some trump cabinet election

    "US military offsprey flights": "US military Osprey flights paused again amid safety questions",
    "Biden pardons Hunter of crimes": "Biden’s pardon of his son makes presidential history"
};
