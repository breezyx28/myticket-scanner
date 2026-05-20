import type { Login2faChallenge, LoginResponse, LoginSuccess } from "./auth"

export function isLoginSuccess(response: LoginResponse): response is LoginSuccess {
  return "token" in response && typeof (response as LoginSuccess).token === "string"
}

export function isLogin2faChallenge(response: LoginResponse): response is Login2faChallenge {
  return "two_factor_required" in response && (response as Login2faChallenge).two_factor_required === true
}
