import react, {type FormEvent, useState} from 'react';
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import {usePuterStore} from "~/lib/puter";
import {useNavigate} from "react-router";
import {convertPdfToImage} from "~/lib/pdf2img";
import {generateUUID} from "~/lib/utils";
import {prepareInstructions} from "../../constants";

const Upload = () => {
    const { auth, isLoading, fs, ai, kv} = usePuterStore()
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(false);
    const [statusText, setStatusText] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const handleFileSelect = (file: File | null) => {
        setFile(file)
    }
    const handleAnalyze = async({content,file}: {content: string, file: File}) => {
        setIsProcessing(true);
        setStatusText("Uploading File...")
        const uploadFile = await fs.upload([file])

        if (!uploadFile) return setStatusText("No file uploaded")
        setStatusText("Converting to image..")
        const imageFile = await convertPdfToImage(file)
        if (!imageFile || !imageFile.file) {
            return setStatusText("Failed to convert PDF to image")
        }
        // ADD THESE LINES TO DEBUG
        console.log('Type of imageFile.file:', typeof imageFile.file);
        console.log('The actual imageFile.file object:', imageFile.file);

        setStatusText("Uploading Image...")
        const uploadedImage = await fs.upload([imageFile.file!])
        if (!uploadedImage) return setStatusText("Failed to upload image")

        setStatusText("Preparing data...")

        const uuid = generateUUID()
        const data = {
            id:uuid,
            contentPath: uploadedImage.path,
            imagePath: uploadedImage.path,
            content: content,
            feedback: '',
        }
        await kv.set(`content:${uuid}`,JSON.stringify(data))
        setStatusText("Analyzing file...")
        const feedback = await ai.feedback(
            uploadedImage.path,
            prepareInstructions({content})
        )
        if (!feedback) return setStatusText("Failed to analyse content")
        const feedbackText = typeof feedback.message.content === 'string'
            ? feedback.message.content: feedback.message.content[0].text

        data.feedback = JSON.parse(feedbackText)
        await kv.set(`content:${uuid}`,JSON.stringify(data))
        setStatusText("Analysis Complete Redirecting...")
        console.log(data)
        navigate(`/content/${uuid}`)
    }
    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget.closest('form');
        if(!form) return;
        const formData = new FormData(form);

        const content = formData.get('content') as string;
        if(!file) return;
        handleAnalyze({content, file})
    }
    return(
        <main className="bg-[url('/images/bg-main.svg')] bg-cover">
            <Navbar />
            <section className="main-section">
                <div className="page-heading py-16">
                    <h1>Uncover AI-Generated Content with Ease</h1>
                    {isProcessing ? (
                        <>
                            <h2>{statusText}</h2>
                            <img src="/images/resume-scan.gif" className="w-full" />
                        </>
                    ):(
                        <h2>Drop your content for Scanning it.</h2>
                    )}
                    {!isProcessing && (
                        <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-4 mt-8">
                            <div className="form-div">
                                <label htmlFor="job-title">Content</label>
                                <textarea rows={16} name="content" id="content" placeholder="Paste Content Here" />
                            </div>
                            <div className="form-div">
                                <label htmlFor="uploader">Upload</label>
                                <FileUploader onFileSelect={handleFileSelect}/>
                            </div>


                            <button className="primary-button" type="submit">
                                Analyze your Content
                            </button>
                        </form>
                    )}
                </div>
            </section>
        </main>
    )
}

export default Upload;