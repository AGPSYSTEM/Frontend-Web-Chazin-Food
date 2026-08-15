const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getToken = () => localStorage.getItem("token");

export const adicionesService = {
  getAdiciones: async () => {
    const res = await fetch(`${API_URL}/adiciones`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Error al obtener adiciones");
    return res.json();
  },

  getAdicionById: async (id) => {
    const res = await fetch(`${API_URL}/adiciones/${id}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Error al obtener la adición");
    return res.json();
  },

  createAdicion: async (data) => {
    const res = await fetch(`${API_URL}/adiciones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al crear la adición");
    }
    return res.json();
  },

  updateAdicion: async (id, data) => {
    const res = await fetch(`${API_URL}/adiciones/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Error al actualizar la adición");
    }
    return res.json();
  },

  deleteAdicion: async (id) => {
    const res = await fetch(`${API_URL}/adiciones/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${getToken()}` },
    });
    if (!res.ok) throw new Error("Error al eliminar la adición");
    return res.json();
  }
};
