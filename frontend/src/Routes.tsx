import React from "react";
import ReactDOM from "react-dom/client";
import { Routes, Route } from "react-router";
import LandingPage from "./pages/LandingPage";
import Layout from "./pages/Layout";
import ChatsIndex from "./pages/Chats";
import FlowsIndex from "./pages/Flows";
import {
    Home,
    Settings,
    Workflow,
    MessageSquareText
} from "lucide-react";


const AppRoutes = () => {
    return(
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="app" element={<Layout />}>
                <Route path="chats" element={<ChatsIndex />} />
                <Route path="flows" element={<FlowsIndex />} />
            </Route>
        </Routes>
    )
}

export const menuItems = [
    { icon: <Home size={18} />, label: "Dashboard", path: '/app' },
    { icon: <MessageSquareText size={18} />, label: "Chats", badge: "05", path: '/app/chats' },
    { icon: <Workflow size={18} />, label: "Flows", path: '/app/flows' },
];

export default AppRoutes;
