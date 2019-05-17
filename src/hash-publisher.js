import Publisher from "./publisher.js";

const HashPublisher = () => {
    const publisher = Publisher();
    const api = {
        get hash() {
            return location.hash.toString().replace(/^#/, "");
        },
        get subscribe() {
            return publisher.subscribe;
        }
    };
    api.initialState = api.hash;

    let currentHash = api.hash;
    setInterval(
        () => {
            const hash = api.hash;

            if (hash !== currentHash) {
                currentHash = hash;
                publisher.publish(hash);
            }
        },
        50
    );

    return api;
};

export default HashPublisher;
