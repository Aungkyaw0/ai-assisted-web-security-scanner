/**
 * delay.js
 * Simple promise-based delay helper.
 * Used to pause between ZAP scan progress polls without blocking the event loop.
 */
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));