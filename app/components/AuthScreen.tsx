'use client';

import { LogIn, UserPlus } from 'lucide-react';

export const AuthScreen = ({
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
}: any) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-xs bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100">
        {/* 상단 로고 영역 */}
        <div className="bg-[#FEE500] py-3 px-4 flex flex-col items-center justify-center">
          <img
            src={LOGIN_LOGO_URL}
            alt="KAKAO BOARD GAMES"
            className="w-44 h-auto object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => setAuthTab('login')}
            className={`flex-1 py-2.5 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              authTab === 'login'
                ? 'bg-white text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-400'
            }`}
          >
            <LogIn size={15} /> 로그인
          </button>
          <button
            type="button"
            onClick={() => setAuthTab('signup')}
            className={`flex-1 py-2.5 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              authTab === 'signup'
                ? 'bg-white text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-400'
            }`}
          >
            <UserPlus size={15} /> 회원가입
          </button>
        </div>

        {/* 폼 영역 */}
        <div className="p-4">
          {authTab === 'login' ? (
            /* ⚡ [로그인 폼] 키체인 자동완성을 위한 autocomplete="username" / "current-password" 적용 */
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="login-username" className="font-bold text-slate-900 text-xs block">
                  아이디 (LDAP)
                </label>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="예: user.kakao"
                  value={loginId}
                  /* ⚡ 대문자 입력 시 소문자로 자동 변환 */
                  onChange={(e) => setLoginId(e.target.value.toLowerCase())}
                  className="w-full border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-300 px-3.5 py-2 rounded-xl focus:outline-none focus:bg-white focus:border-slate-900 text-xs transition"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="login-password" className="font-bold text-slate-900 text-xs block">
                    비밀번호
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      alert('관리자에게 비밀번호 재설정을 문의해 주세요.')
                    }
                    className="text-[11px] text-slate-400 hover:text-slate-600 underline"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </div>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="비밀번호 입력"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-300 px-3.5 py-2 rounded-xl focus:outline-none focus:bg-white focus:border-slate-900 text-xs transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-800 transition active:scale-[0.99] cursor-pointer shadow-sm mt-1"
              >
                로그인
              </button>
            </form>
          ) : (
            /* ⚡ [회원가입 폼] 키체인 자동완성을 위한 new-password 적용 */
            <form onSubmit={handleSignUp} className="space-y-2">
              <div className="space-y-0.5">
                <label htmlFor="signup-username" className="font-bold text-slate-900 text-xs block">
                  아이디
                </label>
                <input
                  id="signup-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="예: user.kakao"
                  value={signUpForm.userId}
                  /* ⚡ 대문자 입력 시 소문자로 자동 변환 */
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, userId: e.target.value.toLowerCase() })
                  }
                  className="w-full border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-300 px-3 py-1.5 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900 text-xs"
                />
              </div>

              <div className="space-y-0.5">
                <label htmlFor="signup-name" className="font-bold text-slate-900 text-xs block">
                  이름
                </label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="홍길동"
                  value={signUpForm.name}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, name: e.target.value })
                  }
                  className="w-full border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-300 px-3 py-1.5 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900 text-xs"
                />
              </div>

              <div className="space-y-0.5">
                <label htmlFor="signup-email-prefix" className="font-bold text-slate-900 text-xs block">
                  이메일
                </label>
                <div className="flex gap-1 items-center">
                  <input
                    id="signup-email-prefix"
                    name="email"
                    type="text"
                    autoComplete="email"
                    placeholder="이메일 아이디"
                    value={signUpForm.emailPrefix}
                    /* ⚡ 대문자 입력 시 소문자로 자동 변환 */
                    onChange={(e) => {
                      setSignUpForm({
                        ...signUpForm,
                        emailPrefix: e.target.value.toLowerCase(),
                      });
                      setIsEmailVerified(false);
                    }}
                    className="flex-1 min-w-0 border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-300 px-2.5 py-1.5 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900 text-xs"
                  />
                  <span className="text-slate-400 font-bold">@</span>
                  <select
                    value={signUpForm.emailDomain}
                    onChange={(e) => {
                      setSignUpForm({
                        ...signUpForm,
                        emailDomain: e.target.value,
                      });
                      setIsEmailVerified(false);
                    }}
                    className="flex-1 min-w-0 border border-slate-200 bg-slate-50/50 text-slate-900 px-1 py-1.5 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900 text-xs"
                  >
                    {ALLOWED_EMAIL_DOMAINS.map((domain: string) => (
                      <option key={domain} value={domain}>
                        {domain}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleCheckEmail}
                  className="w-full mt-1 bg-slate-100 border border-slate-200 text-slate-700 font-bold py-1.5 rounded-lg text-xs hover:bg-slate-200 transition cursor-pointer"
                >
                  이메일 중복 확인
                </button>
              </div>

              <div className="space-y-0.5">
                <label htmlFor="signup-password" className="font-bold text-slate-900 text-xs block">
                  비밀번호
                </label>
                <input
                  id="signup-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="비밀번호 입력"
                  value={signUpForm.password}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, password: e.target.value })
                  }
                  className="w-full border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-300 px-3 py-1.5 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900 text-xs"
                />
              </div>

              <div className="space-y-0.5">
                <label htmlFor="signup-password-confirm" className="font-bold text-slate-900 text-xs block">
                  비밀번호 확인
                </label>
                <input
                  id="signup-password-confirm"
                  name="new-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="비밀번호 재입력"
                  value={signUpForm.passwordConfirm}
                  onChange={(e) =>
                    setSignUpForm({
                      ...signUpForm,
                      passwordConfirm: e.target.value,
                    })
                  }
                  className="w-full border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-300 px-3 py-1.5 rounded-lg focus:outline-none focus:bg-white focus:border-slate-900 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-800 transition active:scale-[0.99] cursor-pointer shadow-sm mt-1"
              >
                회원가입
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};