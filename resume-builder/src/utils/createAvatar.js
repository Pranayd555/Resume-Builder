import { createAvatar } from '@dicebear/core';
import { bottts, funEmoji } from '@dicebear/collection';

export function AvatarUser({ seed = 'John Doe' }) {
    return createAvatar(funEmoji, {
        seed,
        size: 128,
        backgroundColor: ["e0f2fe",
            "dbeafe",
            "ccfbf1",
            "fef3c7",
            "ffedd5",
            "fee2e2",
            "f1f5f9",
            "e2e8f0",
            "ede9fe"],
        backgroundType: ["gradientLinear"],
        eyes: ["closed",
            "closed2",
            "cute",
            "glasses",
            "love",
            "plain",
            "shades",
            "sleepClose",
            "stars",
            "wink",
            "wink2"],
        mouth: ["cute",
            "faceMask",
            "kissHeart",
            "lilSmile",
            "plain",
            "shy",
            "smileLol",
            "smileTeeth",
            "tongueOut",
            "wideSmile"],
        // ... other options
    }).toDataUri();
}

export function AvatarWorks({ seed = 'E-commerce Platform' }) {
    return createAvatar(bottts, {
        seed,
        size: 32,
        backgroundColor: ["000000"],
        backgroundType: ["gradientLinear"],
        baseColor: ["e0f2fe",
            "dbeafe",
            "ccfbf1",
            "fef3c7",
            "ffedd5",
            "fee2e2",
            "f1f5f9",
            "e2e8f0",
            "ede9fe"],
        top: [
            "antenna",
            "antennaCrooked",
            "bulb01",
            "glowingBulb01",
            "glowingBulb02",
            "lights",
            "radar"
        ],
        eyes: [
            "bulging",
            "eva",
            "frame1",
            "frame2",
            "glow",
            "happy",
            "hearts",
            "robocop",
            "round",
            "roundFrame01",
            "roundFrame02",
            "sensor",
            "shade01"
        ]
        // ... other options
    }).toDataUri();
}