/**
 * Data Management - Auth Module
 */
(function(Handler) {
    const _ = Handler._internal;

    Handler.login = async function(username, password) {
        await _.initPromise;
        const snap = await _.db.collection('users').where('username', '==', username).get();
        if (snap.empty) throw new Error("Incorrect username or password.");
        
        const userData = snap.docs[0].data();
        const credential = await _.auth.signInWithEmailAndPassword(userData.email, password);
        
        const userProfile = { 
            id: snap.docs[0].id,
            ...userData, 
            role: userData.role || 'Auditor', 
            uid: credential.user.uid,
            restrictions: userData.restrictions || (userData.role === 'Auditor' ? _.ALL_AUDITOR_RESTRICTIONS : (userData.role ? [] : _.ALL_AUDITOR_RESTRICTIONS))
        };
        
        if (!userData.role) {
            _.db.collection('users').doc(userProfile.id).set({ role: 'Auditor' }, { merge: true })
              .catch(e => console.warn("Background role update blocked:", e.message));
        }

        _.currentUser = userProfile;
        localStorage.setItem('cloudbased_session', JSON.stringify(_.currentUser));
        
        await Handler.addActivityLog({
            title: 'User Login',
            details: `Successfully signed in from ${navigator.platform || 'Web'}.`,
            category: 'user'
        }).catch(e => console.warn("Log failed:", e));

        return _.currentUser;
    };

    Handler.signup = async function(userData) {
        await _.initPromise;
        const usernameLower = userData.username.toLowerCase();
        const check = await _.db.collection('users').get();
        const existingUser = check.docs.find(d => d.data().username?.toLowerCase() === usernameLower);
        if (existingUser) throw new Error("Username already taken.");

        let emailToUse = userData.email || `${userData.username.toLowerCase()}@cloudbased.internal`;

        try {
            const credential = await _.auth.createUserWithEmailAndPassword(emailToUse, userData.password);
            const profile = {
                uid:      credential.user.uid,
                name:     userData.name,
                username: userData.username,
                email:    userData.email || '',
                role:     'Auditor',
                restrictions: _.ALL_AUDITOR_RESTRICTIONS,
                createdAt: new Date().toISOString(),
                settings: { theme: 'light', lowStockThreshold: 1000, isThresholdEnabled: false }
            };

            await _.db.collection('users').doc(credential.user.uid).set(profile);
            
            _.currentUser = profile;
            localStorage.setItem('cloudbased_session', JSON.stringify(_.currentUser));
            
            await Handler.addActivityLog({
                title: 'New Account Created',
                details: `Successful self-registration for ${userData.name} (@${userData.username}).`,
                category: 'user'
            }).catch(e => console.warn("Log failed:", e));

            return _.currentUser;
        } catch (e) {
            if (e.code === 'auth/email-already-in-use' && !userData.email) {
                throw new Error("A system-generated email for this username already exists. Please contact an admin.");
            }
            throw e;
        }
    };

    Handler.logout = function() {
        if (_.auth) _.auth.signOut();
        _.currentUser = null;
        _.collectionCache = {
            inventory: { data: null, timestamp: 0 },
            inputLogs: { data: null, timestamp: 0 },
            outputLogs: { data: null, timestamp: 0 },
            suppliers: { data: null, timestamp: 0 }
        };
        localStorage.removeItem('cloudbased_session');
        location.reload();
    };

    Handler.updateProfile = async function(data) {
        await _.initPromise;
        
        if (data.username && data.username.toLowerCase() !== _.currentUser.username.toLowerCase()) {
            const users = await Handler.getUsers();
            if (users.some(u => u.username?.toLowerCase() === data.username.toLowerCase())) {
                throw new Error("Username is already taken.");
            }
        }

        const updates = {
            name: data.name,
            username: data.username || _.currentUser.username,
            profilePicture: data.profilePicture
        };

        if (data.email !== undefined && data.email !== _.currentUser.email) {
            const user = _.auth.currentUser;
            if (user) {
                if (data.email) {
                    await user.updateEmail(data.email);
                } else {
                    await user.updateEmail(`${updates.username.toLowerCase()}@cloudbased.internal`);
                }
                updates.email = data.email || '';
            }
        }
        
        await _.db.collection('users').doc(_.currentUser.uid).update(updates);

        if (_.auth.currentUser) {
            await _.auth.currentUser.updateProfile({ displayName: data.name });
        }
        _.currentUser = { ..._.currentUser, ...updates };
        localStorage.setItem('cloudbased_session', JSON.stringify(_.currentUser));
        
        await Handler.addActivityLog({
            title: 'Profile Updated',
            details: `Modified personal account details and/or display name.`,
            category: 'user'
        });

        return _.currentUser;
    };

    Handler.changePassword = async function(oldPass, newPass) {
        await _.initPromise;
        const user = _.auth.currentUser;
        const cred = firebase.auth.EmailAuthProvider.credential(user.email, oldPass);
        await user.reauthenticateWithCredential(cred);
        await user.updatePassword(newPass);

        await Handler.addActivityLog({
            title: 'Security Sync',
            details: 'User successfully updated their account password.',
            category: 'user'
        });
    };

    Handler.deleteAccount = async function() {
        await _.initPromise;
        const user = _.auth.currentUser;
        if (user) {
            await _.db.collection('users').doc(user.uid).delete();
            await user.delete();
            _.currentUser = null;
            localStorage.removeItem('cloudbased_session');
            location.reload();
        }
    };

    Handler.sendPasswordResetEmail = async function(identifier) {
        await _.initPromise;
        let emailToSend = identifier;
        if (!identifier.includes('@')) {
            const usernameLower = identifier.toLowerCase();
            const snap = await _.db.collection('users').get();
            const userDoc = snap.docs.find(d => d.data().username?.toLowerCase() === usernameLower);
            
            if (!userDoc) throw new Error("User not found.");
            
            const data = userDoc.data();
            emailToSend = data.email || `${data.username.toLowerCase()}@cloudbased.internal`;
            
            if (!data.email) {
                throw new Error("This account does not have a registered email address. Please contact an admin to reset your password.");
            }
        }
        await _.auth.sendPasswordResetEmail(emailToSend);
    };

    Handler.confirmPasswordReset = async function(code, newPassword) {
        await _.initPromise;
        await _.auth.confirmPasswordReset(code, newPassword);
    };

})(window.AppDataHandler);
