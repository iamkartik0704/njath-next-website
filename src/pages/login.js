import React, { useState, useEffect } from "react";
import styles from "@/styles/login.module.css";
import { useRouter } from "next/router";
import Link from "next/link";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";

import Nav from "../components/Navbar/nav";
import { useAuth } from "@context/AuthContext";
import Head from "next/head";

export default function Login() {
    const [details, setDetails] = useState({ email: "", password: "" });
    const router = useRouter();
    const { setIsLoggedIn } = useAuth();
    const loginApiUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/login`;

    useEffect(() => {
        if (router.query.error) {
            toast.error(decodeURIComponent(router.query.error));
        }
    }, [router.query.error]);

    const submitHandler = async (e) => {
        e.preventDefault();
        if (!details.email || !details.password) {
            toast.error("Please fill in both email and password fields");
            return;
        }

        const config = {
            withCredentials: true,
        };

        try {
            const response = await axios.post(loginApiUrl, details, config);

            if (response.data.success === false) {
                toast.error(response.data.message);
            } else {
                if (response.data.token) {
                    localStorage.setItem("token", response.data.token);
                }
                toast.success(response.data.message);
                setIsLoggedIn(true);
                router.push("/levels");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
        }
    };

    return (
        <>
            <Head>
                <title>Login - NJATH</title>
            </Head>
            <Nav className="z-50"></Nav>
            <ToastContainer autoClose={2000} />

            <Image
                src="/assets/treasure_box.svg"
                className={styles.treasurebox}
                width={900.44}
                height={1000}
                alt="Treasure image"
            ></Image>

            <div className={styles.mainContainer}>
                <form className={styles.loginBox} onSubmit={submitHandler}>
                    <div className="head_text">Login</div>

                    <div className="flex flex-col justify-end w-full">
                        <input
                            className="form_input w-full"
                            type="email"
                            placeholder="Email"
                            onChange={(s) => {
                                setDetails({ email: s.target.value, password: details.password });
                            }}
                            required
                        />
                    </div>

                    <div className="flex flex-col justify-end w-full">
                        <input
                            className="form_input autofill:bg-transparent autofill:text-white"
                            type="password"
                            placeholder="Password"
                            onChange={(s) => {
                                setDetails({ email: details.email, password: s.target.value });
                            }}
                            required
                        />
                        <div className="text-white/90 hover:text-white hover:underline text-sm mt-1.5 self-end font-medium">
                            <Link className="forgot-password-link" href="/forgotPass">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="black_btn w-full grow-1 h-12 rounded-sm text-xl"
                    >
                        Login
                    </button>

                    <div className="flex items-center my-1 w-full">
                        <div className="flex-grow border-t border-white/20"></div>
                        <span className="flex-shrink mx-3 text-white/50 text-xs uppercase tracking-wider">or</span>
                        <div className="flex-grow border-t border-white/20"></div>
                    </div>

                    <a
                        href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`}
                        className="flex items-center justify-center gap-3 w-full h-12 rounded-sm bg-white hover:bg-gray-100 text-gray-800 font-semibold text-base transition duration-150 ease-in-out cursor-pointer shadow-sm no-underline"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                        </svg>
                        <span>Continue with Google</span>
                    </a>

                    <div className={styles.registerRedir}>
                        <span className="text-white/70 font-medium">
                            Not registered yet?
                            <br />
                        </span>
                        <Link
                            href="/register"
                            className="text-white/90 hover:text-njathgold underline hover:text-njathgold text-sm mt-1.5 self-end font-medium"
                        >
                            Register Now!
                        </Link>
                    </div>
                </form>
            </div>
        </>
    );
}
