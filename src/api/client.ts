import axios, { AxiosError } from "axios";

/**
 * Базовый URL бэкенда. HttpOnly JWT-куки — поэтому withCredentials: true
 * обязателен на каждом запросе (и на стороне сервера должен быть настроен
 * корректный CORS с Access-Control-Allow-Credentials: true и конкретным origin).
 */
export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

export const apiClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export interface ApiErrorShape {
  status: number;
  message: string;
  raw: unknown;
}

/**
 * Приводим ошибки axios/Nest к единому виду. Nest обычно отдаёт
 * { statusCode, message, error }, где message может быть строкой
 * или массивом строк (class-validator).
 */
export function normalizeApiError(error: unknown): ApiErrorShape {
  if (axios.isAxiosError(error)) {
    const err = error as AxiosError<{ message?: string | string[]; error?: string }>;
    const data = err.response?.data;
    const rawMessage = data?.message;
    const message = Array.isArray(rawMessage)
      ? rawMessage.join(", ")
      : rawMessage ?? data?.error ?? err.message ?? "Неизвестная ошибка сети";

    return {
      status: err.response?.status ?? 0,
      message,
      raw: data,
    };
  }

  return {
    status: 0,
    message: error instanceof Error ? error.message : "Неизвестная ошибка",
    raw: error,
  };
}

/** Строит абсолютный URL до бинарного ресурса (например, аватарки). */
export function buildAssetUrl(path: string): string {
  return `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
