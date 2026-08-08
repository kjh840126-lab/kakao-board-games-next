'use client';

import React from 'react';
import { LogIn, UserPlus } from 'lucide-react';

interface AuthScreenProps {
  LOGIN_LOGO_URL: string;
  authTab: 'login' | 'signup';
  setAuthTab: (tab: 'login' | 'signup') => void;
  loginId: string;
  setLoginId: (val: string) => void;
  loginPassword: string;
  setLoginPassword: (val: string) => void;
  handleLogin: (e: React.FormEvent) => void;
  signUpForm: any;
  setSignUpForm: (form: any) => void;
  handleCheckEmail: () => void;
  handleSignUp: (e: React.FormEvent) => void;
  setIsEmailVerified: (verified: boolean) => void;
  ALLOWED_EMAIL_DOMAINS: string[];
}

export function AuthScreen({
  LOGIN_LOGO_URL,
  authTab,
  setAuthTab,
  loginId,
  setLoginId,
  loginPassword,
  setLoginPassword,
  handleLogin,
  signUpForm,
  setSignUpForm,
  handleCheckEmail,
  handleSignUp,
  setIsEmailVerified,
  ALLOWED_EMAIL_DOMAINS,
}: AuthScreenProps) {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl overflow-hidden text-xs border border-slate-100">
        
        {/* 상단 노란색 배너 */}
        <div className="bg-[#FEE500] p-8 flex flex-col items-center justify-center relative">
          <img 
            src={LOGIN_LOGO_URL} 
            alt="KAKAO BOARD GAMES" 
            className="w-48 h-auto object-contain drop-shadow-sm select-none"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <div className="text-center font-black text-slate-900 text-2xl tracking-tighter mt-2">
            <span className="text-sky-600">KAKAO</span> BOARD GAMES
          </div>
        </div>

        {/* 탭 헤더 */}
        <div className="flex border-b border-slate-200 bg-white">
          <button
            type="button"
            onClick={() => setAuthTab('login')}
            className={`flex-1 py-3.5 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              authTab === 'login'
                ? 'border-b-2 border-slate-900 text-slate-900 bg-white'
                : 'text-slate-400 bg-slate-50 hover:text-slate-600'
            }`}
          >
            <LogIn size={15} /> 로그인
          </button>
          <button
            type="button"
            onClick={() => setAuthTab('signup')}
            className={`flex-1 py-3.5 font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              authTab === 'signup'
                ? 'border-b-2 border-slate-900 text-slate-900 bg-white'
                : 'text-slate-400 bg-slate-50 hover:text-slate-600'
            }`}
          >
            <UserPlus size={15} /> 회원가입
          </button>
        </div>

        {/* 1. 로그인 폼 */}
        {authTab === 'login' && (
          <div className="p-6 space-y-4 bg-white">
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="font-extrabold text-slate-900 block mb-1.5">아이디 (LDAP)</label>
                <input
                  type="text"
                  required
                  placeholder="hayden.hoi"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value.toLowerCase())}
                  className="w-full border-0 bg-[#B8C2D1]/50 focus:bg-white focus:ring-2 focus:ring-slate-900 p-3.5 rounded-2xl text-slate-900 font-medium transition"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="font-extrabold text-slate-900">비밀번호</label>
                  <button
                    type="button"
                    onClick={() => alert('관리자에게 문의해 주세요.')}
                    className="text-[11px] text-slate-500 underline hover:text-slate-900"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full border-0 bg-[#B8C2D1]/50 focus:bg-white focus:ring-2 focus:ring-slate-900 p-3.5 rounded-2xl text-slate-900 font-medium transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#0F172A] hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl cursor-pointer transition shadow-md mt-2"
              >
                로그인
              </button>
            </form>
          </div>
        )}

        {/* 2. 회원가입 폼 */}
        {authTab === 'signup' && (
          <div className="p-6 space-y-3.5 bg-white">
            <form onSubmit={handleSignUp} className="space-y-3">
              <div>
                <label className="font-extrabold text-slate-900 block mb-1">아이디 (LDAP)</label>
                <input
                  type="text"
                  required
                  placeholder="예: new.kakao"
                  value={signUpForm.userId}
                  onChange={(e) => setSignUpForm({ ...signUpForm, userId: e.target.value.toLowerCase() })}
                  className="w-full border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 p-3 rounded-xl text-slate-900 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-900 block mb-1">이름</label>
                <input
                  type="text"
                  required
                  placeholder="홍길동"
                  value={signUpForm.name}
                  onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                  className="w-full border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 p-3 rounded-xl text-slate-900 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-900 block mb-1">이메일 주소</label>
                <div className="flex gap-1.5 items-center">
                  <input
                    type="text"
                    required
                    placeholder="이메일 아이디"
                    value={signUpForm.emailPrefix}
                    onChange={(e) => {
                      setSignUpForm({ ...signUpForm, emailPrefix: e.target.value });
                      setIsEmailVerified(false);
                    }}
                    className="flex-1 min-w-0 border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 p-3 rounded-xl text-slate-900 placeholder-slate-400"
                  />
                  <span className="text-slate-400 font-bold">@</span>
                  <select
                    value={signUpForm.emailDomain}
                    onChange={(e) => {
                      setSignUpForm({ ...signUpForm, emailDomain: e.target.value });
                      setIsEmailVerified(false);
                    }}
                    className="border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-slate-900 p-3 rounded-xl text-slate-900 font-semibold cursor-pointer"
                  >
                    {ALLOWED_EMAIL_DOMAINS.map(domain => (
                      <option key={domain} value={domain}>{domain}</option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleCheckEmail}
                  className="w-full mt-2 bg-[#0F172A] text-white font-bold py-2.5 rounded-xl cursor-pointer hover:bg-slate-800 transition"
                >
                  이메일 중복 확인
                </button>
              </div>

              <div>
                <label className="font-extrabold text-slate-900 block mb-1">비밀번호</label>
                <input
                  type="password"
                  required
                  placeholder="비밀번호 입력"
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                  className="w-full border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 p-3 rounded-xl text-slate-900 placeholder-slate-400"
                />
              </div>

              <div>
                <label className="font-extrabold text-slate-900 block mb-1">비밀번호 확인</label>
                <input
                  type="password"
                  required
                  placeholder="비밀번호 재입력"
                  value={signUpForm.passwordConfirm}
                  onChange={(e) => setSignUpForm({ ...signUpForm, passwordConfirm: e.target.value })}
                  className="w-full border border-slate-200 bg-white focus:ring-2 focus:ring-slate-900 p-3 rounded-xl text-slate-900 placeholder-slate-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#DCE2EC] text-slate-600 font-bold py-3.5 rounded-2xl cursor-pointer hover:bg-slate-900 hover:text-white transition shadow-sm mt-2"
              >
                가입 완료하기
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}