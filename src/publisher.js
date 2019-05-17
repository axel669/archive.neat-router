const Publisher = () => {
    const listeners = new Map();

    return {
        subscribe: handler => {
            const id = `${Date.now()}:${Math.random()}`;
            listeners.set(id, handler);
            return () => listeners.delete(id);
        },
        publish: message => {
            for (const handler of listeners.values()) {
                handler(message);
            }
        }
    };
};

export default Publisher;
