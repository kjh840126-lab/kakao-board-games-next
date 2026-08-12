'use client';

import { useState } from 'react';
import { LogIn, UserPlus, Mail, Lock, X } from 'lucide-react';
import { supabase } from '../supabaseClient';

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
  users = [],
  fetchInitialData,
}: any) => {
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [isSendingCode, setIsSendingCode] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // ⚡ 비밀번호 확인 일치 여부 체크
  const isPasswordMismatch =
    signUpForm.passwordConfirm &&
    signUpForm.password &&
    signUpForm.password !== signUpForm.passwordConfirm;

  // ⚡ 1단계: Supabase OTP 발송
  const handleSendResetEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim().toLowerCase();

    if (!cleanEmail) {
      alert('이메일을 입력해 주세요.');
      return;
    }

    const existingUser = (users || []).find((u: any) => u.email?.toLowerCase() === cleanEmail);
    if (!existingUser) {
      alert('등록되지 않은 이메일 주소입니다.');
      return;
    }

    setIsSendingCode(true);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: cleanEmail,
      });

      if (error) throw error;

      alert(`'${cleanEmail}' 주소로 6자리 인증번호가 발송되었습니다.`);
      setResetStep(2);
    } catch (err: any) {
      alert('인증번호 발송 실패: ' + (err.message || err));
    } finally {
      setIsSendingCode(false);
    }
  };

  // ⚡ 2단계: 6자리 OTP 검증 및 비밀번호 변경
  const handleVerifyAndChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = resetEmail.trim().toLowerCase();

    if (newPassword !== newPasswordConfirm) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (resetCode.trim().length !== 6) {
      alert('6자리 인증번호를 정확히 입력해 주세요.');
      return;
    }

    setIsVerifying(true);

    try {
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        email: cleanEmail,
        token: resetCode.trim(),
        type: 'email',
      });

      if (verifyErr) {
        throw new Error('인증번호가 올바르지 않거나 만료되었습니다.');
      }

      // 비밀번호 업데이트
      const { error: updateErr } = await supabase
        .from('users')
        .update({ password_hash: newPassword })
        .eq('email', cleanEmail);

      if (updateErr) throw updateErr;

      alert('비밀번호가 성공적으로 변경되었습니다!\n새 비밀번호로 로그인해 주세요.');

      handleCloseForgotPassword();
      if (fetchInitialData) fetchInitialData();
    } catch (err: any) {
      alert('비밀번호 변경 실패: ' + (err.message || err));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCloseForgotPassword = () => {
    setIsForgotPasswordOpen(false);
    setResetStep(1);
    setResetEmail('');
    setResetCode('');
    setNewPassword('');
    setNewPasswordConfirm('');
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
      <div className="w-full max-w-xs bg-white dark:bg-slate-900 rounded-3xl shadow-lg overflow-hidden border border-slate-100 dark:border-slate-800">
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

        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setAuthTab('login')}
            className={`flex-1 py-2.5 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer ${
              authTab === 'login'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
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
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-b-2 border-slate-900 dark:border-white'
                : 'text-slate-400'
            }`}
          >
            <UserPlus size={15} /> 회원가입
          </button>
        </div>

        <div className="p-4">
          {authTab === 'login' ? (
            /* 로그인 폼 */
            <form onSubmit={handleLogin} className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="login-username" className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                  아이디
                </label>
                <input
                  id="login-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="아이디 입력"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value.toLowerCase().replace(/\./g, ''))}
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 px-3.5 py-2 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-slate-900 dark:focus:border-slate-700 text-xs transition"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label htmlFor="login-password" className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                    비밀번호
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsForgotPasswordOpen(true)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 underline cursor-pointer"
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
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 px-3.5 py-2 rounded-xl focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-slate-900 dark:focus:border-slate-700 text-xs transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 dark:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition active:scale-[0.99] cursor-pointer shadow-sm mt-1"
              >
                로그인
              </button>
            </form>
          ) : (
            /* 회원가입 폼 */
            <form onSubmit={handleSignUp} className="space-y-2">
              <div className="space-y-0.5">
                <label htmlFor="signup-username" className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                  아이디
                </label>
                <input
                  id="signup-username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  placeholder="LDAP 사용 금지"
                  value={signUpForm.userId || ''}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, userId: e.target.value.toLowerCase().replace(/\./g, '') })
                  }
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 px-3 py-1.5 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-slate-900 text-xs"
                />
              </div>

              <div className="space-y-0.5">
                <label htmlFor="signup-name" className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                  이름
                </label>
                <input
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  placeholder="실명만 입력 가능"
                  value={signUpForm.name || ''}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, name: e.target.value })
                  }
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 px-3 py-1.5 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-slate-900 text-xs"
                />
              </div>

              <div className="space-y-0.5">
                <label htmlFor="signup-email-prefix" className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                  이메일
                </label>
                <input
                  id="signup-email-prefix"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="회사 이메일 사용 금지"
                  value={signUpForm.emailPrefix || signUpForm.email || ''}
                  onChange={(e) => {
                    setSignUpForm({
                      ...signUpForm,
                      emailPrefix: e.target.value.toLowerCase(),
                      email: e.target.value.toLowerCase(),
                    });
                    if (setIsEmailVerified) setIsEmailVerified(false);
                  }}
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 px-3 py-1.5 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-slate-900 dark:focus:border-slate-700 text-xs"
                />
                <button
                  type="button"
                  onClick={handleCheckEmail}
                  className="w-full mt-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold py-1.5 rounded-lg text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
                >
                  이메일 중복 확인
                </button>
              </div>

              <div className="space-y-0.5">
                <label htmlFor="signup-password" className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                  비밀번호
                </label>
                <input
                  id="signup-password"
                  name="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="LDAP 비밀번호는 사용 금지"
                  value={signUpForm.password || ''}
                  onChange={(e) =>
                    setSignUpForm({ ...signUpForm, password: e.target.value })
                  }
                  className="w-full border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 px-3 py-1.5 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-slate-900 text-xs"
                />
              </div>

              <div className="space-y-0.5">
                <label htmlFor="signup-password-confirm" className="font-bold text-slate-900 dark:text-slate-100 text-xs block">
                  비밀번호 확인
                </label>
                <input
                  id="signup-password-confirm"
                  name="new-password-confirm"
                  type="password"
                  autoComplete="new-password"
                  placeholder="비밀번호 재입력"
                  value={signUpForm.passwordConfirm || ''}
                  onChange={(e) =>
                    setSignUpForm({
                      ...signUpForm,
                      passwordConfirm: e.target.value,
                    })
                  }
                  className={`w-full border ${
                    isPasswordMismatch ? 'border-red-500' : 'border-slate-200 dark:border-slate-800'
                  } bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white placeholder:text-slate-400 px-3 py-1.5 rounded-lg focus:outline-none focus:bg-white dark:focus:bg-slate-800 focus:border-slate-900 text-xs`}
                />
                {isPasswordMismatch && (
                  <p className="text-[10px] text-red-500 font-medium mt-1">
                    비밀번호가 일치하지 않습니다.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-slate-900 dark:bg-slate-800 text-white font-bold py-2.5 rounded-xl text-xs hover:bg-slate-800 dark:hover:bg-slate-700 transition active:scale-[0.99] cursor-pointer shadow-sm mt-1"
              >
                회원가입
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 🟡 비밀번호 재설정 모달 */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[0.5px]" onClick={handleCloseForgotPassword} />

          <div className="relative rounded-3xl w-full max-w-xs overflow-hidden shadow-2xl bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs border dark:border-slate-800">
            <div className="bg-[#FEE500] py-4 px-5 flex justify-center items-center relative">
              <img
                src={LOGIN_LOGO_URL}
                alt="Kakao Board Games"
                className="w-44 h-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <button
                type="button"
                onClick={handleCloseForgotPassword}
                className="absolute top-3 right-3 text-slate-700 hover:text-slate-900 p-1 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 pt-4">
              {resetStep === 1 ? (
                <form onSubmit={handleSendResetEmail} className="space-y-3.5">
                  <div className="flex items-center justify-center gap-1.5 text-slate-900 dark:text-white font-extrabold text-sm mb-1">
                    <Mail size={16} />
                    <span>비밀번호 찾기</span>
                  </div>

                  <div>
                    <label className="font-bold block mb-1 text-slate-800 dark:text-slate-200 text-[11px]">가입 이메일 주소</label>
                    <input
                      type="email"
                      required
                      placeholder="이메일 입력"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-slate-900 dark:text-white text-xs focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 bg-slate-50/50 dark:bg-slate-800/60 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleCloseForgotPassword}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-bold cursor-pointer transition text-xs"
                    >
                      취소
                    </button>
                    {/* ⚡ [강제 반영] 다크모드에서 로그인 버튼과 동일한 배경색, 외곽선, 텍스트 스타일 적용 */}
                    <button
                      type="submit"
                      disabled={isSendingCode}



                      className="flex-1 bg-[#FEE500] dark:bg-slate-800 hover:bg-[#fada00] dark:hover:!bg-slate-700 dark:!bg-[#1e293b] text-slate-900 dark:!text-white font-extrabold dark:!font-bold py-2.5 rounded-xl border border-transparent dark:!border-slate-700 cursor-pointer transition text-xs shadow-xs disabled:opacity-50"
                    >
                      {isSendingCode ? '발송 중...' : '재설정 메일 발송'}
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndChangePassword} className="space-y-2.5">
                  <div className="flex items-center justify-center gap-1.5 text-slate-900 dark:!border-slate-700 dark:!text-white font-extrabold text-sm mb-0.5">
                    <Lock size={16} />
                    <span>새 비밀번호 설정</span>
                  </div>

                  <p className="text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-lg">
                    <strong className="text-slate-800 dark:text-slate-200">{resetEmail}</strong>로 발송된 6자리 번호를 입력하세요.
                  </p>

                  <div>
                    <label className="font-bold block mb-0.5 text-slate-800 dark:text-slate-200 text-[10px]">인증번호 6자리</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      placeholder="123456"
                      value={resetCode}
                      onChange={(e) => setResetCode(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-center font-mono font-extrabold text-xs tracking-widest bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-0.5 text-slate-800 dark:text-slate-200 text-[10px]">새 비밀번호</label>
                    <input
                      type="password"
                      required
                      placeholder="새 비밀번호 입력"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-slate-900 dark:text-white text-xs bg-slate-50/50 dark:bg-slate-800/60 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 placeholder:text-slate-400"
                    />
                  </div>

                  <div>
                    <label className="font-bold block mb-0.5 text-slate-800 dark:text-slate-200 text-[10px]">새 비밀번호 확인</label>
                    <input
                      type="password"
                      required
                      placeholder="새 비밀번호 재입력"
                      value={newPasswordConfirm}
                      onChange={(e) => setNewPasswordConfirm(e.target.value)}
                      className="w-full border border-slate-200 dark:border-slate-800 p-2 rounded-xl text-slate-900 dark:text-white text-xs bg-slate-50/50 dark:bg-slate-800/60 focus:outline-none focus:border-slate-400 dark:focus:border-slate-700 placeholder:text-slate-400"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 py-2.5 rounded-xl font-bold cursor-pointer text-xs"
                    >
                      이전
                    </button>
                    {/* ⚡ 2단계 비밀번호 변경 버튼도 동일하게 다크모드 전용 스타일 지정 */}
                    <button
                      type="submit"
                      disabled={isVerifying}
                      className="flex-1 bg-[#FEE500] dark:bg-slate-800 hover:bg-[#fada00] dark:hover:bg-slate-700 text-slate-900 dark:text-white font-extrabold dark:font-bold py-2.5 rounded-xl border border-transparent dark:border-slate-700 cursor-pointer text-xs shadow-xs disabled:opacity-50"
                    >
                      {isVerifying ? '변경 중...' : '비밀번호 변경'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};