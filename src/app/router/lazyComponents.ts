import { lazy } from 'react';

// Компоненты фич
export const Chat = lazy(() => import('@pages/chat').then((module) => ({ default: module.Chat })));

// Компоненты страниц
export const Login = lazy(() => import('@pages/login').then((module) => ({ default: module.Login })));

export const Signup = lazy(() => import('@pages/signup').then((module) => ({ default: module.Signup })));

export const NotFound = lazy(() => import('@pages/not-found').then((module) => ({ default: module.NotFound })));

// Компоненты лейаутов
export const MainLayout = lazy(() => import('@widgets/layouts').then((module) => ({ default: module.MainLayout })));

export const AuthLayout = lazy(() => import('@widgets/layouts').then((module) => ({ default: module.AuthLayout })));
