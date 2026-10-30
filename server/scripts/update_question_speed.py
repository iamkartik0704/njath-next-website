import os

WORKSPACE = r"C:\Users\iamka\Desktop\njath\njath-next-website"

# 1. Update src/components/Level/level.js
level_file = os.path.join(WORKSPACE, "src", "components", "Level", "level.js")
level_content = """import React, { useEffect, useState } from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import QuestionList from "@components/QuestionList/QuestionList";
import Loading from "@components/Loading/Loading";
import Image from "next/image";
import axios from "axios";

const Level = ({ unlocked, level }) => {
    const [isAccordionOpen, setIsAccordionOpen] = useState(false);
    const router = useRouter();
    const handleAccordionChange = () => {
        setIsAccordionOpen(!isAccordionOpen);
    };
    const solved = 1;
    const tempcolor = unlocked ? "rgba(253, 204, 6, 1)" : "#FFFFFF8C";
    const customStyles = {
        "--font-color": tempcolor,
        "--disabled-opacity": !unlocked || solved ? 0.5 : 1,
    };

    const [data, setData] = useState(null);
    const [loadingQuestions, setLoadingQuestions] = useState(false);
    const levelDetailApi = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/participant/get-level-details?level=${level + 1}`;

    const fetchLevelData = async () => {
        if (loadingQuestions || data) return;
        setLoadingQuestions(true);
        try {
            const response = await axios.get(levelDetailApi, { withCredentials: true });
            if (response.status === 200 && response.data?.success) {
                setData(response.data.data);
            } else if (response.status === 401) {
                router.push("/login");
            }
        } catch (error) {
            console.error("Failed to fetch level details:", error);
            if (error.response?.status === 401) {
                router.push("/login");
            }
        } finally {
            setLoadingQuestions(false);
        }
    };

    // Pre-fetch Level 1 immediately if unlocked; fetch others when accordion is clicked
    useEffect(() => {
        if (unlocked === 1 && (isAccordionOpen || level === 0)) {
            fetchLevelData();
        }
    }, [isAccordionOpen, unlocked, level]);

    return (
        <div style={customStyles} className="font-montserrat">
            <Accordion
                disabled={!unlocked}
                onChange={handleAccordionChange}
                sx={{
                    "&.MuiPaper-root": {
                        backgroundColor: "#111A23",
                        border: "2px solid #FFFFFF8C",
                        borderRadius: "8px",
                        margin: "12px 0",
                    },
                }}
            >
                <AccordionSummary
                    expandIcon={
                        <Image
                            src="/assets/icons/arrow_down.svg"
                            alt="expand"
                            width={20}
                            height={20}
                        />
                    }
                    aria-controls={`panel${level}-content`}
                    id={`panel${level}-header`}
                >
                    <Typography
                        sx={{
                            fontFamily: "Montserrat",
                            fontWeight: "bold",
                            color: tempcolor,
                            fontSize: "1.1rem",
                        }}
                    >
                        Level {level + 1}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails>
                    {data ? (
                        <QuestionList question={data.question} level={level + 1} />
                    ) : (
                        <div className="py-4 flex justify-center">
                            <Loading />
                        </div>
                    )}
                </AccordionDetails>
            </Accordion>
        </div>
    );
};

export default Level;
"""

with open(level_file, "w", encoding="utf-8") as f:
    f.write(level_content)
print("Updated level.js successfully!")

# 2. Update src/pages/question.js
question_file = os.path.join(WORKSPACE, "src", "pages", "question.js")
question_content = """import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuestionBox from "@components/QuestionBox/QuestionBox";
import Loading from "@components/Loading/Loading";
import Head from "next/head";
import axios from "axios";

const Question = () => {
    const router = useRouter();
    const [questionData, setQuestionData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const getParam = (paramName) => {
        if (typeof window !== "undefined") {
            const urlParams = new URLSearchParams(window.location.search);
            const val = urlParams.get(paramName);
            if (val) return parseInt(val, 10);
        }
        if (router.query && router.query[paramName]) {
            return parseInt(router.query[paramName], 10);
        }
        return null;
    };

    useEffect(() => {
        const level = getParam("level");
        const order = getParam("order");

        if (!level || !order || isNaN(level) || isNaN(order)) {
            // Wait until router is ready if query is not available yet
            if (!router.isReady) return;
            toast.error("Invalid question URL");
            router.push("/levels");
            return;
        }

        let isMounted = true;
        const fetchQuestion = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/participant/question`,
                    {
                        params: { level, order },
                        withCredentials: true,
                    }
                );

                if (isMounted && response.data?.success) {
                    setQuestionData(response.data.data);
                } else {
                    toast.error(response.data?.message || "Failed to load question");
                    router.push("/levels");
                }
            } catch (error) {
                console.error("Question fetch error:", error);
                const msg = error.response?.data?.message || "Error loading question";
                toast.error(msg);
                if (error.response?.status === 401) {
                    router.push("/login");
                } else {
                    router.push("/levels");
                }
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchQuestion();

        return () => {
            isMounted = false;
        };
    }, [router.isReady, router.asPath]);

    return (
        <>
            <Head>
                <title>
                    {!questionData
                        ? "Loading Question - NJATH"
                        : `L0${questionData.level} Q0${questionData.order} - NJATH`}
                </title>
            </Head>
            <ToastContainer autoClose={2000} />
            {isLoading || !questionData ? (
                <div className="flex h-screen w-screen items-center justify-center">
                    <Loading />
                </div>
            ) : (
                <QuestionBox
                    imageUrl={questionData.imageUrl}
                    title={questionData.title}
                    description={questionData.description}
                    level={questionData.level}
                    order={questionData.order}
                />
            )}
        </>
    );
};

export default Question;
"""

with open(question_file, "w", encoding="utf-8") as f:
    f.write(question_content)
print("Updated question.js successfully!")
