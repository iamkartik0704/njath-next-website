import React, { useEffect, useState } from "react";
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
