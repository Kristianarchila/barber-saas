import api from "./api";

export async function getMyBarberias() {
    const res = await api.get("/users/me/barberias");
    return res.data;
}
