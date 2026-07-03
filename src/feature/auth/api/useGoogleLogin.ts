import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@shared/api/client";
import { useStore } from "@app/store";
import { notify } from "@shared/lib/notify";
import { isApiError } from "@shared/api/envelope";
import type { AuthResponseDTO } from "@shared/types/api";

interface GoogleLoginPayload {
  id_token: string;
}

export function useGoogleLogin() {
  const setUser = useStore((s) => s.setUser);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (payload: GoogleLoginPayload) => {
      const response = await api.post<AuthResponseDTO>("/auth/google", payload);
      return response.data;
    },
    onSuccess: (data) => {
      const { access_token: _a, refresh_token: _r, ...user } = data;
      void _a;
      void _r;
      setUser(user);
      notify.success("auth.login.success");
      navigate("/overview");
    },
    onError: (error) => {
      if (isApiError(error)) {
        notify.error(error.messageKey);
      } else {
        notify.error("auth.login.failed");
      }
    },
  });
}
