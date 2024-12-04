'use client';

import { useState } from "react";
import { Card, CardContent, Typography } from '@mui/material';
import { RAGSearchResults } from '@/utils'
import styles from '@/app/ui/index.module.css'
import ReactMarkdown from 'react-markdown';
import SearchBar from "./search_bar/search_bar";


export default function Home() {
    const [query, setQuery] = useState("");
    const [completion, setCompletion] = useState("");

    const handleSearch = async (query: string) => {
        console.log(`Query ${query}`)
        const message = await (RAGSearchResults(query))
        message ? setCompletion(message) : console.log("We got an empty response from RAG")
    }

    return (
        <div className={styles.container}>
            <SearchBar
                handleSearch={handleSearch} />
            {completion && (
                <div className={styles.completionContainer}>
                    <Typography variant="h5" component="div">
                        RAG Answer:
                    </Typography>
                    <Card>
                        <CardContent>
                            <ReactMarkdown>{completion}</ReactMarkdown>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}