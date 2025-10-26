import React, {useEffect, useState} from 'react';
import {Link} from "react-router";
import ScoreCircle from "~/components/ScoreCircle";
import {usePuterStore} from "~/lib/puter";
const ContentCard = ( {content}:{content: Content} ) => {
    const {fs} = usePuterStore()
    const [contentUrl, setContentUrl] = useState('')
    useEffect(() => {
        const loadContent = async () => {
            const blob = await fs.read(content.imagePath)
            if(!blob) return
            let url = URL.createObjectURL(blob);
            setContentUrl(url)

        }

        loadContent()
    }, [content.imagePath]);
    return (
        <div>
            <Link to={`/content/${content.id}`} className="resume-card animation-in fade-in duration-1000">
                <div className="resume-card-header">
                    <div className="flex flex-col gap-2">
                        <h2 className=" !text-black font-bold break-words">
                            {content.title}
                        </h2>
                    </div>
                    <div className="flex-shrink-0">
                        <ScoreCircle score={content.feedback.overallScore} />
                    </div>
                </div>


                {contentUrl && (
                    <div className="gradient-border animate-in fade-in duration-1000">
                        <div className="w-full h-full">
                            <img src={contentUrl} alt="image" className="w-full h-[350px] max-sm:h-[200px] object-cover object-top"/>
                        </div>
                    </div>
                )}
            </Link>
        </div>
    );
};

export default ContentCard;