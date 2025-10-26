import type { Route } from "./+types/home"
import Navbar from "~/components/Navbar"
import ContentCard from "~/components/ContentCard"
import {usePuterStore} from "~/lib/puter";
import {Link, useNavigate} from "react-router";
import {useEffect, useState} from "react";
import * as fs from "node:fs";
export function meta({}: Route.MetaArgs) {
    return [
        { title: "BotBuster" },
        { name: "description", content: "Instant Verification" },
    ];
}

export default function Home() {
    const {  auth , kv} = usePuterStore();
    const navigate = useNavigate();
    const [contents, setContents] = useState<Content[]>([])
    const [loadingContents, setLoadingContents] = useState(false)


    useEffect(() => {
        if(!auth.isAuthenticated) navigate('/auth?next=/')
    }, [auth.isAuthenticated]);


    useEffect(() => {
        const loadContents = async () => {
            const contents = (await kv.list('content:*',true)) as KVItem[]
            const parsedContents = contents?.map((content) => (
                JSON.parse(content.value) as Content
            ))
            console.log("parsedREsumes",parsedContents)
            setContents(parsedContents || [])
            setLoadingContents(false)
        }
        loadContents()
    }, []);


    return <main className="bg-[url('/images/bg-main.svg')] bg-cover">
        <Navbar />
        <section className="main-section">
            <div className="page-heading py-16">
                <h1>Bust AI-Written Content</h1>
                {!loadingContents && contents?.length === 0 ?(
                    <h2>No Content Found. Upload your first piece of content to verify it.</h2>
                ):(
                    <h2>Review your submissions and check with AI-powered analysis</h2>
                )}
            </div>
            {loadingContents && (
                <div className="flex flex-col items-center jusitfy-center">
                    <img src="/images/resume-scan-2.gif" className="w-[200px]"/>
                </div>
            )}

            {!loadingContents && contents.length > 0 && (
                <div className="resumes-section">
                    {contents.map( (content) => (
                        <ContentCard key={content.id} content={content}  />
                    ))}
                </div>
            )}

            {!loadingContents && contents?.length === 0  && (
                <div className="flex mt-7 flex-col justify-center items-center gap-4">
                    <Link to="/upload" className="primary-button w-fit text-xl font-semibold">
                        Upload
                    </Link>
                </div>
            )}
        </section>




    </main>
}
