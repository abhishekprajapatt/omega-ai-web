'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, MouseEvent, useCallback } from 'react';

import { assets } from '@/assets/assets';
import { useFirebaseAuth } from '@/context/FirebaseAuthContext';
import { useAppContext } from '@/context/AppContext';

import Sidebar from '@/components/Sidebar';
import PromptBox from '@/components/PromptBox';
import Message from '@/components/Message';

interface MessageType {
  _id?: string;
  role: string;
  content: string;
}

interface SelectedChat {
  _id?: string;
  name: string;
  messages: MessageType[];
}

const Home: React.FC = () => {
  const {
    user: firebaseUser,
    loading: authLoading,
    isAuthenticated,
  } = useFirebaseAuth();
  const router = useRouter();

  const [expand, setExpand] = useState<boolean>(false);
  const [greeting, setGreeting] = useState<string>('');
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [initialLoadDone, setInitialLoadDone] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { selectedChat, setSelectedChat, isWriting } = useAppContext() as any;

  useEffect(() => {
    if (!authLoading) {
      setInitialLoadDone(true);
    }
  }, [authLoading]);


  const getGreeting = useCallback((): string => {
    const now = new Date();
    const hours = now.getHours();

    // Morning greetings (5-12)
    const morningGreetings = [
      'Rise & Grind 🚀',
      'Good Morning, Dev! ☀️',
      'Time to Code 💻',
      "Let's Build Something 🏗️",
      'Morning Motivation 💪',
      'Seize the Day 🎯',
      'Coffee & Code ☕',
    ];

    // Afternoon greetings (12-17)
    const afternoonGreetings = [
      "Let's Ship It ⚡",
      'Afternoon Push 💯',
      'Keep the Momentum 🔥',
      'Crushing It 🎪',
      'Peak Productivity Hours 📈',
      'Making Progress 🛠️',
      'Afternoon Grind 💪',
    ];

    // Evening greetings (17-21)
    const eveningGreetings = [
      'Evening Mode Activated 🌃',
      'Sunset Code Session 🌅',
      'Evening Hustle 🌙',
      'Night Vision Engaged 👓',
      'Second Wind Time ⚡',
      'After Hours Coding 🎸',
      'Evening Flow State 🌊',
    ];

    // Night greetings (21-5)
    const nightGreetings = [
      'Night Owl Energy 🦉',
      'Deep Work Mode 🌌',
      'Midnight Hacker Vibes 🕵️',
      'Night Mode Unlocked 🌙',
      'The Hour of Code ⏰',
      'Late Night Grind 🔌',
      'Nocturnal Developer 🌃',
    ];

    let greetings = [];
    if (hours >= 5 && hours < 12) {
      greetings = morningGreetings;
    } else if (hours >= 12 && hours < 17) {
      greetings = afternoonGreetings;
    } else if (hours >= 17 && hours < 21) {
      greetings = eveningGreetings;
    } else {
      greetings = nightGreetings;
    }

    const randomIndex = Math.floor(Math.random() * greetings.length);
    return greetings[randomIndex];
  }, []);

  const getWelcomeMessage = useCallback((): string => {
    const userWelcomes = [
      "Welcome, {name}! Let's elevate your ideas. 🚀",
      'Hey {name}! Ready to build something amazing? 💡',
      'Welcome back, {name}! Time to create magic ✨',
      "{name}! Let's turn ideas into reality 🎯",
      "Great to see you, {name}! Let's code it up 💻",
      'Welcome, {name}! Your next big idea starts here 🌟',
      "Hey {name}! Excited to see what we'll build 🔥",
      'Welcome, {name}! Innovation mode: ON 🎪',
    ];

    const guestWelcomes = [
      'How can I help you today? 🤔',
      "Let's create something together! 🚀",
      'Ready to explore the possibilities? 💭',
      "What's on your mind? Let's dive in! 🌊",
      "Got an idea? Let's make it happen! 💡",
      'Welcome! What can I build for you? 🛠️',
      "Let's collaborate and create! 🎨",
      "Your journey starts here. Let's go! ⚡",
    ];

    const messageArray = firebaseUser ? userWelcomes : guestWelcomes;
    const randomIndex = Math.floor(Math.random() * messageArray.length);
    let message = messageArray[randomIndex];

    if (firebaseUser && firebaseUser.displayName) {
      message = message.replace('{name}', firebaseUser.displayName);
    } else {
      message = message.replace('{name}', 'Developer');
    }

    return message;
  }, [firebaseUser]);

  useEffect(() => {
    setGreeting(getGreeting());
    setWelcomeMessage(getWelcomeMessage());
  }, [getGreeting, getWelcomeMessage]);

  useEffect(() => {
    setSelectedChat(null);
  }, [setSelectedChat]);

  useEffect(() => {
    if (containerRef.current && selectedChat?.messages) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [selectedChat?.messages]);

  const handleToggleExpand = (e: MouseEvent<HTMLImageElement>): void => {
    e.stopPropagation();
    setExpand((prev) => !prev);
  };

  if (!initialLoadDone) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {isAuthenticated ? (
        <Sidebar expand={expand} setExpand={setExpand} />
      ) : (
        <Image
          src={assets.logo_icon}
          alt="Logo"
          width={100}
          height={100}
          className="flex absolute top-10 right-2"
        />
      )}

      <div className="flex-1 flex flex-col items-center justify-center px-2 sm:px-6 pb-12 sm:pb-8 bg-[#09090b] text-white relative">
        <div className="md:hidden absolute px-4 top-6 flex items-center justify-between w-full">
          {isAuthenticated ? (
            <>
              <Image
                onClick={handleToggleExpand}
                className="rotate-180 cursor-pointer"
                src={assets.menu_icon as string}
                alt="Menu"
                width={24}
                height={24}
              />
              <Image
                className="opacity-70"
                src={assets.chat_icon as string}
                alt="Chat"
                width={24}
                height={24}
              />
            </>
          ) : (
            <>
              <Image
                src={assets.logo_icon as string}
                alt="Omega Logo"
                width={24}
                height={24}
              />
              <div className="flex gap-2">
                <button
                  onClick={() => router.push('/sign-in')}
                  className="px-3 py-1 text-sm rounded-full bg-transparent border border-gray-500 hover:border-white hover:text-white transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push('/sign-up')}
                  className="px-3 py-1 text-sm rounded-full cursor-pointer bg-primary hover:bg-primary/80 transition-all"
                >
                  Sign Up
                </button>
              </div>
            </>
          )}
        </div>

        {!isAuthenticated && (
          <div className="hidden md:flex absolute top-6 right-6 gap-3">
            <button
              onClick={() => router.push('/sign-in')}
              className="px-4 py-2 rounded-full cursor-pointer bg-transparent border border-gray-500 hover:border-white hover:text-white transition-all"
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/sign-up')}
              className="px-4 py-2 rounded-full cursor-pointer bg-primary hover:bg-primary/80 hover:border-primary transition-all"
            >
              Sign Up
            </button>
          </div>
        )}

        {!selectedChat || selectedChat.messages.length === 0 ? (
          <>
            <div className="flex items-center gap-3">
              <Image
                src={assets.logo_icon as string}
                alt="Omega Logo"
                width={40}
                height={40}
                className="sm:h-14 sm:w-14 rounded-full select-none"
              />
              <p className="text-md sm:text-xl md:text-4xl font-head font-black text-shadow-white select-none">
                {greeting}
              </p>
            </div>
            <p className="text-xs md:text-sm font-head text-center my-2 md:my-4 mask-b-from-neutral-50 select-none">
              {welcomeMessage}
            </p>
          </>
        ) : (
          <div
            ref={containerRef}
            className="w-full max-w-3xl flex-1 overflow-y-auto mb-2 flex flex-col gap-4 scrollbar-hide mx-auto justify-center items-center"
          >
            {selectedChat.messages.map(
              (message: MessageType, index: number) => (
                <Message
                  key={index}
                  role={message.role}
                  content={message.content}
                  index={index}
                  messageId={message._id || `msg-${index}`}
                  isWriting={isWriting}
                  expand={expand}
                  setExpand={setExpand}
                />
              ),
            )}
          </div>
        )}

        <PromptBox />
        <p className="text-xs absolute bottom-5 sm:bottom-1 font-head text-gray-500">
          Omega can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
};

export default Home;
