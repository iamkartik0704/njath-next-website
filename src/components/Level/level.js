import React, { useEffect, useState } from "react";
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
