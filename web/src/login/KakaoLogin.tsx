/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

declare global {
    interface Window {
        Kakao: any;
    }
}

export default function KakaoLogin() {
    const navigate = useNavigate();

    // SDK 초기화 (맨 처음 한 번만)
    useEffect(() => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
            console.log("✅ Kakao SDK init");
        }
    }, []);

    const handleKakaoLogin = () => {
        if (!window.Kakao) return;

        window.Kakao.Auth.login({
            scope: "profile_nickname",
            success() {
                window.Kakao.API.request({
                    url: "/v2/user/me",
                    success: async (res: any) => {
                        const kakaoId = String(res.id);
                        const nickname =
                            res.kakao_account?.profile?.nickname ?? "알고트랙 유저";

                        try {
                            // 로그인 + 신규면 자동 생성
                            const response = await api.post("/auth/login", {
                                socialId: kakaoId,
                                socialType: "KAKAO",
                                nickname,
                            });

                            const token = response.data.accessToken;
                            localStorage.setItem("accessToken", token);

                            // alert 대신 온보딩 페이지로 이동
                            navigate("/login-success", { replace: true });
                        } catch (err) {
                            console.error(err);
                            alert("로그인 중 오류 발생");
                        }
                    },
                });
            },
            fail(error: any) {
                console.error(error);
                alert("카카오 로그인 실패");
            },
        });
    };

    const buttonImageSrc = "/kakao_login_large_wide.png";

    return (
        <button
            className="p-0 bg-transparent border-none hover:scale-105 transition-transform duration-200"
            onClick={handleKakaoLogin}
        >
            <img
                src={buttonImageSrc}
                alt="카카오 로그인"
                className="w-[320px] md:w-[350px] h-auto"
            />
        </button>
    );
}
