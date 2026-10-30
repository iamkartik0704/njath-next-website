import React, { useEffect, useState } from "react";
import styles from "@/styles/register.module.css";
import stylesLogin from "@/styles/login.module.css";
import { useRouter } from "next/router";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Image from "next/image";
import Nav from "@components/Navbar/nav";
import Link from "next/link";
import Head from "next/head";

export default function Register() {
    const [details, setDetails] = useState({
        email: "",
        fullname: "",
        password: "",
        username: "",
        phone: "",
    });
    const router = useRouter();

    useEffect(() => {
        if (router.query.error) {
            toast.error(decodeURIComponent(router.query.error));
        }
    }, [router.query.error]);

    const register = async () => {
        if (details.email.length == 0) toast.error("Please enter your Email address");
        else if (details.fullname.length == 0) toast.error("Please enter your Full Name");
        else if (details.phone.length != 10)
            toast.error("Please enter a valid Indian Phone Number");
        else if (details.username.length == 0) toast.error("Please enter your Username");
        else if (details.password.length < 8) toast.error("Password must be atleast 8 characters");
        else {
            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register-participant`,
                    details
                );
                if (response.data.success === false) toast.error(response.data.message);
                else {
                    toast.success("Registration successful. Login to continue.");
                    router.push("/login");
                }
            } catch (error) {
                toast.error(error.response?.data?.message || "Registration failed");
            }
        }
    };

    return (
        <div className="font-montserrat">
            <Head>
                <title>Register - NJATH</title>
            </Head>
            <ToastContainer autoClose={2000} />
            <Nav className="styles.navText"></Nav>

            <Image
                src="/assets/treasure_box.svg"
                className={styles.treasurebox}
                width={1300}
                height={700}
                alt="treasure box"
            ></Image>
            <div className={styles.mainContainer}>
                <div
                    className={styles.registerBox}
                    onKeyUp={(event) => {
                        if (event.key == "Enter") register();
                    }}
                >
                    <div className={styles.title}>Register</div>
                    <div className={styles.inputDiv}>
                        <input
                            className={styles.inputField}
                            type="text"
                            placeholder="Full Name"
                            onChange={(s) => {
                                setDetails({ ...details, fullname: s.target.value });
                            }}
                            required
                        />
                    </div>
                    <div className={styles.inputDiv}>
                        <input
                            type="email"
                            className={styles.inputField}
                            placeholder="Email"
                            onChange={(s) => {
                                setDetails({ ...details, email: s.target.value });
                            }}
                            required
                        />
                    </div>
                    <div className={styles.inputDiv}>
                        <input
                            type="text"
                            className={styles.inputField}
                            placeholder="Username"
                            onChange={(s) => {
                                setDetails({ ...details, username: s.target.value });
                            }}
                            required
                        />
                    </div>
                    <div className={styles.inputDiv}>
                        <input
                            type="password"
                            className={styles.inputField}
                            placeholder="Create New Password"
                            onChange={(s) => {
                                setDetails({ ...details, password: s.target.value });
                            }}
                            required
                        />
                    </div>
                    <div className={styles.inputDiv}>
                        <input
                            type="text"
                            className={styles.inputField}
                            placeholder="Mobile Number"
                            onChange={(s) => {
                                if (
                                    s.target.value.length > 10 ||
                                    s.target.value.match(/[^0-9]/g) != null
                                )
                                    s.target.value = s.target.value.substring(
                                        0,
                                        s.target.value.length - 1
                                    );
                                setDetails({ ...details, phone: s.target.value });
                            }}
                            required
                        />
                    </div>

                    <button onClick={() => register()} className={styles.submit}>
                        Register
                    </button>

                    <div className="flex items-center my-2 w-full">
                        <div className="flex-grow border-t border-white/20"></div>
                        <span className="flex-shrink mx-3 text-white/50 text-xs uppercase tracking-wider">or</span>
                        <div className="flex-grow border-t border-white/20"></div>
                    </div>

                    <a
                        href={`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/google`}
                        className="flex items-center justify-center gap-3 w-full h-11 rounded-sm bg-white hover:bg-gray-100 text-gray-800 font-semibold text-base transition duration-150 ease-in-out cursor-pointer shadow-sm no-underline"
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

                    <div className={styles.already}>Already Registered?</div>
                    <Link className={styles.login} href="/login">
                        Login
                    </Link>
                </div>
                <div className={styles.imageContainer}>
                    <Image
                        src="/assets/treasure_box.svg"
                        alt="treasurebox"
                        width={1300}
                        height={700}
                        priority={4}
                    ></Image>
                </div>
            </div>
        </div>
    );
}
