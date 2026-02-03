import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ArrowRight } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

import styles from './login-view.module.css';
import * as React from "react";

interface LoginViewProps {
  onLogin: () => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(false);

    if (!email || !password) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (email === 'admin' && password === 'admin') {
        onLogin();
      } else {
        setError(true);
      }
    }, 800);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.hero}>
          <div className={styles.heroIconWrap}>
            <Lock className={styles.heroIcon} />
          </div>
          <h1 className={styles.heroTitle}>환영합니다!</h1>
          <p className={styles.heroSubtitle}>개인 포트폴리오 대시보드에 로그인하세요</p>
          <p className={styles.heroSubtitle}>(ID : admin / pw : admin)</p>
        </div>

        <div className={styles.body}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Email */}
            <div className={styles.field}>
              <Label htmlFor="email">이메일 주소</Label>
              <div className={styles.inputWrap}>
                <div className={styles.leftIcon} aria-hidden="true">
                  <Mail className={styles.iconMd} />
                </div>
                <Input
                  id="email"
                  type="text"
                  placeholder="ID"
                  className={styles.inputPl10}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div className={styles.field}>
              <div className={styles.rowBetween}>
                <Label htmlFor="password">비밀번호</Label>
                {/*<a href="#" className={styles.linkSm}>
                    비밀번호를 잊으셨나요?
                  </a>*/}
              </div>

              <div className={styles.inputWrap}>
                <div className={styles.leftIcon} aria-hidden="true">
                  <Lock className={styles.iconMd} />
                </div>

                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`${styles.inputPl10} ${styles.inputPr10}`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={styles.rightIconBtn}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? <EyeOff className={styles.iconMd} /> : <Eye className={styles.iconMd} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            {error && (
              <div className={styles.errorMessage}>
                아이디 또는 비밀번호가 올바르지 않습니다.
              </div>
            )}
            <Button
              type="submit"
              className={`${styles.submitBtn} ${styles.group}`}
              disabled={isLoading}
            >
              {isLoading ? (
                '로그인 중...'
              ) : (
                <>
                  로그인
                  <ArrowRight className={`${styles.arrowIcon} ${styles.arrowMove}`} />
                </>
              )}
            </Button>

            {/*<div className={styles.footerText}>
                계정이 없으신가요?{' '}
                <a href="#" className={styles.linkMd}>
                  회원가입
                </a>
              </div>*/}
          </form>
        </div>
      </div>
    </div>
  );
}
