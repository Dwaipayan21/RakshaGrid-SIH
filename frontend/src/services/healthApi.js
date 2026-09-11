import { apiFetch } from "./api";

export function checkBackendHealth() {
    return apiFetch("/health");
}