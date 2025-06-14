import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { useHost } from "../contexts/HostContext";

export const useStreamApi = () => {
  const { token } = useAuth();
  const { host, protocol } = useHost();
  const baseUrl = `${protocol}://${host}:8000`;

  const authHeaders = {
    headers: { Authorization: `Bearer ${token}` },
  };

  const getMyStreams = () => {
    return axios.get(`${baseUrl}/stream/my`, authHeaders);
  };

  const createStream = (title: string) => {
    return axios.post(`${baseUrl}/stream/create`, { title }, authHeaders);
  };

  const deleteStream = (id: number) => {
    return axios.delete(`${baseUrl}/stream/delete/${id}`, authHeaders);
  };

  const getLiveStreamByUser = (username: string) => {
    return axios.get(`${baseUrl}/stream/watch/${username}`, authHeaders);
  };

  return {
    getMyStreams,
    createStream,
    deleteStream,
    getLiveStreamByUser,
  };
};
