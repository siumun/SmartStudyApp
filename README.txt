#SmartStudyApp
SmartStudyApp is a mobile application developed using React Native to help users manage study tasks efficiently. It supports task scheduling, real-time study tracking, location logging, and chatbot assistance.

--------
#Github link
https://github.com/siumun/SmartStudyApp

--------
#Features
Task Management
Users can create, view, edit, and delete study tasks. Tasks are categorised into **Planned** and **Completed** states for better organisation.

Task Scheduling
Users can assign a title and select a date for each task, helping them plan their study activities in advance.

Real-Time Study Timer
A built-in timer tracks study sessions in real time, allowing users to pause, resume, and end tasks while recording total duration.

Location Tracking
The app records GPS coordinates during study sessions and stores them in the database.

Chatbot Assistant
A chatbot feature provides real-time responses using a Node.js backend server.

--------

#How to Use the App
Home Screen
- Displays all tasks (planned and completed)
- Users can swipe to delete tasks
- Tap a task to view details

Create Task
- Click the **FAB (+ button)** on Home screen
- Choose **Start Now** or **Plan Task**
- Enter title and date

Location Tracking
- After starting a task, the app captures current GPS location
- Location is stored automatically in SQLite database

Timer Screen
- Tracks study duration in real time
- Users can pause, resume, or end session
- Duration is saved when task is completed

Chatbot
- Tap **Chatbot** in bottom navigation
- Type message and press Send
- Receive instant response from server

--------

#Database Structure

The application uses SQLite (`SmartStudy.db`) with 3 main tables:

### 📌 tasks
- id
- title
- date
- status

### 📍 locations
- id
- name
- lat
- lng

### ⏱ sessions
- id
- task_id
- location_id
- duration

--------

#Navigation Structure

### Bottom Tab Navigation
- Home
- Map
- Chatbot

### Stack Navigation
- CreatePlan
- StartNow
- ViewPlanned
- ViewDone
- Edit
- Timer
- Location

-------

#Chatbot Setup
The chatbot requires a Node.js server.
Step 1: cd src
Step 2: cd server
Step 3: npm install
Step 4: node service.js