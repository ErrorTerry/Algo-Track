/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import api from "../api";

declare global {
    interface Window {
        Kakao: any;
    }
}

export default function KakaoLogin() {
    // SDK 초기화 (맨 처음 한 번만)
    useEffect(() => {
        if (window.Kakao && !window.Kakao.isInitialized()) {
            window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
            console.log("✅ Kakao SDK init");
        }
    }, []);

    const handleKakaoLogin = () => {
        if (!window.Kakao) {
            alert("Kakao SDK가 로드되지 않았어요 ㅠㅠ");
            return;
        }

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
                            // 1) 기존 유저인지 확인
                            const r = await api.get(`/users/by-social/${kakaoId}`);
                            const user = r.data;

                            localStorage.setItem("userId", String(user.userId ?? ""));
                            localStorage.setItem("authToken", user.token ?? "dummy");

                            alert(`${user.nickname ?? nickname}님, 로그인 완료!`);
                        } catch (err: any) {
                            if (err.response?.status === 404) {
                                // 2) 없으면 회원가입
                                const created = await api.post("/users", {
                                    socialId: kakaoId,
                                    socialType: "KAKAO",
                                    nickname,
                                });
                                const newUser = created.data;

                                localStorage.setItem(
                                    "userId",
                                    String(newUser.userId ?? "")
                                );
                                localStorage.setItem("authToken", "dummy");

                                alert(`${nickname}님, 회원가입 완료!`);
                            } else {
                                console.error(err);
                                alert("로그인 중 오류가 발생했어요 ㅠㅠ");
                            }
                        }
                    },
                    fail(error: any) {
                        console.error(error);
                        alert("카카오 프로필 조회 실패 ㅠㅠ");
                    },
                });
            },
            fail(error: any) {
                console.error(error);
                alert("카카오 로그인 실패 ㅠㅠ");
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
