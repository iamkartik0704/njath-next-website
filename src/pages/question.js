import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import QuestionBox from "@components/QuestionBox/QuestionBox";
import Head from 'next/head';

function getQueryParameters(url) {
    const queryParameters = new URL(url, `${process.env.NEXT_PUBLIC_FRONTEND_URL}`).searchParams;
    const level = parseInt(queryParameters.get("level"), 10);
    const order = parseInt(queryParameters.get("order"), 10);

    console.log("URL:", url); // Check the URL being passed to the function
    console.log("Extracted level:", level);
    console.log("Extracted order:", order);

    return { level, order };
}

const Question = () => {
    const router = useRouter();

    const [questionData, setQuestionData] = useState(null);

    const getQuestionData = async (ApiEndpoint, config) => {
        try {
            const response = await fetch(ApiEndpoint, config);
            const data = await response.json();
            console.log(data);
            if (response.ok) {
                setQuestionData(data.data);
            } else if (response.status === 400) {
                if (data.message) {
                    toast.error(data.message);
                    router.push("/levels")
                }
                else {
                    toast.error("Unknown error occured");
                    router.push("/levels")
                }
            } else {
                console.error(`Failed to fetch data. Status: ${response.status}`);
                router.push("/levels")
            }
        } catch (error) {
            toast.error("Something Broke! Please Refresh");
            router.push("/levels")
        }
    };

    const getData = async () => {
        const { level, order } = getQueryParameters(router.asPath);

        if (!level || !order) {
            toast.error("Invalid Link");
        }

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const config = {
            credentials: "include",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        };
        const ApiEndpoint = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/participant/question?level=${Number(level)}&order=${Number(order)}`;

        await getQuestionData(ApiEndpoint, config);
    }

    useEffect(() => {
        const fetchData = async () => {
            const res = await getData();
            console.log(res);
        };

        fetchData();
    }, []);

    const [open, setOpen] = useState(false);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    return (
        <>
        <Head>
        <title>{!questionData? "Loading Question" : `L0${questionData.level} Q0${questionData.order}`}</title>
      </Head>
            <ToastContainer autoClose={2000} />
            {questionData !== null ? (
                <QuestionBox
                    imageUrl={questionData.imageUrl}
                    title={questionData.title}
                    description={questionData.description}
                    level={questionData.level}
                    order={questionData.order}
                />
            ) : (<div> Loading ...</div>)
            }
        </>
    );
};

export default Question;
