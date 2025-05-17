import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const today = new Date().toISOString().split("T")[0];
  const API = import.meta.env.VITE_API_URL;

  const fetchTasks = async (url = `${API}/tasks`) => {
    try {
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(res.data);
    } catch {
      setError("No se pudieron cargar las tareas");
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleCreateTask = async ({ title, description, dueDate }) => {
    try {
      const res = await axios.post(
        `${API}/tasks`,
        { title, description, dueDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) => [...prev, res.data.task]);
    } catch {
      setError("No se pudo crear la tarea");
    }
  };

  const handleUpdateTask = async ({ id, title, description, dueDate }) => {
    try {
      const res = await axios.put(
        `${API}/tasks/${id}`,
        { title, description, dueDate },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data.task : t))
      );
      setEditTask(null);
    } catch {
      setError("No se pudo editar la tarea");
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await axios.put(
        `${API}/tasks/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks((prev) =>
        prev.map((t) => (t.id === id ? res.data.task : t))
      );
    } catch {
      setError("No se pudo actualizar el estado");
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`${API}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch {
      setError("No se pudo eliminar la tarea");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-green-600">
          Bienvenido al Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
        >
          Cerrar sesión
        </button>
      </div>

      <button
        onClick={() => setShowModal(true)}
        className="mb-6 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Crear tarea
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Nueva Tarea</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const title = e.target.title.value;
                const description = e.target.description.value;
                const dueDate = e.target.dueDate.value;
                handleCreateTask({ title, description, dueDate });
                setShowModal(false);
              }}
              className="space-y-4"
            >
              <input
                name="title"
                type="text"
                placeholder="Título"
                required
                className="w-full border px-3 py-2 rounded"
              />
              <textarea
                name="description"
                placeholder="Descripción"
                className="w-full border px-3 py-2 rounded"
              ></textarea>
              <input
                name="dueDate"
                type="date"
                min={today}
                className="w-full border px-3 py-2 rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-gray-300 px-3 py-1 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Editar Tarea</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const title = e.target.title.value;
                const description = e.target.description.value;
                const dueDate = e.target.dueDate.value;
                handleUpdateTask({
                  id: editTask.id,
                  title,
                  description,
                  dueDate,
                });
              }}
              className="space-y-4"
            >
              <input
                name="title"
                type="text"
                defaultValue={editTask.title}
                required
                className="w-full border px-3 py-2 rounded"
              />
              <textarea
                name="description"
                defaultValue={editTask.description}
                className="w-full border px-3 py-2 rounded"
              ></textarea>
              <input
                name="dueDate"
                type="date"
                min={today}
                defaultValue={editTask.dueDate?.slice(0, 10)}
                className="w-full border px-3 py-2 rounded"
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditTask(null)}
                  className="bg-gray-300 px-3 py-1 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mb-4">
        <select
          onChange={(e) => {
            const value = e.target.value;
            const url =
              value === "todas"
                ? `${API}/tasks`
                : `${API}/tasks?status=${value}`;
            fetchTasks(url);
          }}
          className="border px-2 py-1 rounded"
        >
          <option value="todas">Todas</option>
          <option value="pendiente">Pendientes</option>
          <option value="en progreso">En progreso</option>
          <option value="completada">Completadas</option>
        </select>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const term = e.target.search.value;
          fetchTasks(`${API}/tasks?search=${term}`);
        }}
        className="mb-6"
      >
        <input
          name="search"
          type="text"
          placeholder="Buscar tareas..."
          className="border px-2 py-1 mr-2 rounded"
        />
        <button className="bg-gray-600 text-white px-3 py-1 rounded">
          Buscar
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      {tasks.length === 0 ? (
        <p className="text-gray-600">No hay tareas disponibles.</p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="p-4 border rounded bg-white shadow-sm hover:bg-gray-50 space-y-1"
            >
              <h2 className="font-semibold">{task.title}</h2>
              <p className="text-sm text-gray-600">{task.description}</p>
              {task.dueDate && (
                <p className="text-xs text-gray-500">
                  Fecha límite: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
              <p className="text-xs text-gray-400">Estado: {task.status}</p>

              <div className="flex flex-wrap gap-4">
                {task.status === "pendiente" && (
                  <button
                    onClick={() => updateStatus(task.id, "en progreso")}
                    className="text-sm text-blue-600 underline"
                  >
                    Marcar como en progreso
                  </button>
                )}
                {task.status === "en progreso" && (
                  <button
                    onClick={() => updateStatus(task.id, "completada")}
                    className="text-sm text-green-600 underline"
                  >
                    Marcar como completada
                  </button>
                )}
                {task.status === "completada" && (
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="text-sm text-red-600 underline"
                  >
                    Eliminar tarea
                  </button>
                )}
                {task.status !== "completada" && (
                  <button
                    onClick={() => setEditTask(task)}
                    className="text-sm text-yellow-600 underline"
                  >
                    Editar
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
