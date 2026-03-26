/**
 * Firebase Bridge Module
 * Provides the legacy Firestore/Auth implementation for 'Cloud Mode'.
 */
window.FirebaseBridge = (function() {
    let db = null;
    let auth = null;
    let config = null;

    const init = async () => {
        try {
            const response = await fetch('assets/data/firestore_config.json');
            config = await response.json();
            
            // Avoid re-init
            if (!firebase.apps.length) {
                firebase.initializeApp(config);
            }
            db = firebase.firestore();
            auth = firebase.auth();
            
            // Wait for auth to settle
            return new Promise((resolve) => {
                const unsub = auth.onAuthStateChanged((user) => {
                    unsub();
                    resolve(user);
                });
                // Fallback timeout
                setTimeout(resolve, 5000);
            });
        } catch (e) {
            console.error("Firebase Bridge Init Failed", e);
            throw e;
        }
    };

    const getData = async (collection) => {
        const snap = await db.collection(collection).get();
        return snap.docs.map(doc => ({ 
            ...doc.data(), 
            id: doc.id,
            timestamp: doc.data().timestamp || (doc.data().created ? new Date(doc.data().created).getTime() : Date.now())
        }));
    };

    const upsertData = async (collection, data) => {
        const id = data.id || data.itemCode || db.collection(collection).doc().id;
        const docRef = db.collection(collection).doc(id);
        const finalData = { ...data, lastModified: firebase.firestore.FieldValue.serverTimestamp() };
        await docRef.set(finalData, { merge: true });
        return { id, ...finalData };
    };

    const deleteData = async (collection, id) => {
        await db.collection(collection).doc(id).delete();
    };

    const login = async (identifier, password) => {
        let email = identifier;
        
        // If identifier is a username (no @), look up email in users collection
        if (!identifier.includes('@')) {
            const snap = await db.collection('users').where('username', '==', identifier).limit(1).get();
            if (snap.empty) throw new Error("No user found with that username in legacy Firebase.");
            email = snap.docs[0].data().email;
        }

        const credential = await auth.signInWithEmailAndPassword(email, password);
        return credential.user;
    };

    const getProfile = async (uid) => {
        const snap = await db.collection('users').doc(uid).get();
        return snap.exists ? snap.data() : null;
    };

    const logout = async () => {
        await auth.signOut();
    };

    const sendReset = async (identifier) => {
        let email = identifier;
        if (!identifier.includes('@')) {
            const snap = await db.collection('users').where('username', '==', identifier).limit(1).get();
            if (snap.empty) throw new Error("No user found with that username in legacy Firebase.");
            email = snap.docs[0].data().email;
        }
        await auth.sendPasswordResetEmail(email);
    };

    return { init, getData, upsertData, deleteData, login, logout, sendReset, getProfile };
})();
