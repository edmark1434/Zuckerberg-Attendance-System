# QR Attendance System

## Project Overview

A modern serverless QR Code Attendance System built using React, TypeScript, Vite, Tailwind CSS, shadcn/ui, and Supabase.

The application provides a centralized attendance management system for a university.

The system is composed of three portals:

- Admin Portal
- Teacher Portal
- Student Portal

Realtime synchronization is powered by Supabase Realtime.

---

## Project Goal

Replace manual attendance sheets with QR Code based attendance.

The system should:

- Manage teachers
- Manage students
- Manage sections
- Assign students to sections
- Assign teachers to sections
- Generate attendance QR codes
- Record attendance
- Display attendance history
- Update attendance in realtime

---

## Technology Stack

Frontend

- React
- TypeScript
- Vite

Styling

- Tailwind CSS v4
- shadcn/ui
- tw-animate-css
- Geist Variable Font

Backend

- Supabase PostgreSQL
- Supabase Realtime
- Row Level Security

Architecture

Serverless

No Express backend.

Frontend communicates directly with Supabase.

---

## Current Scope

One University

Multiple Teachers

Multiple Sections

Admin Managed

QR Attendance

Realtime Updates

Student Portal

Teacher Portal

Admin Portal