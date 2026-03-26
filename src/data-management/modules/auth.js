/**
 * Data Management - Auth Module
 */
(function(Handler) {
    const _ = Handler._internal;

    Handler.login = async function(username, password) {
        await _.initPromise;

        if (_.getMode() === 'FIREBASE') {
            const fbUser = await window.FirebaseBridge.login(username, password);
            _.currentUser = { 
                uid: fbUser.uid, 
                email: fbUser.email, 
                role: 'Administrator',
                restrictions: []
            };
            localStorage.setItem('cloudbased_session', JSON.stringify(_.currentUser));
            return _.currentUser;
        }

        const authData = await _.pb.collection('users').authWithPassword(username, password);
        const userRec = authData.record;
        
        const userProfile = { 
            ...userRec, 
            uid: userRec.id,
            role: userRec.role || 'Auditor', 
            restrictions: userRec.restrictions || (userRec.role === 'Auditor' ? _.ALL_AUDITOR_RESTRICTIONS : (userRec.role ? [] : _.ALL_AUDITOR_RESTRICTIONS))
        };
        
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
        if (_.getMode() === 'FIREBASE') {
            throw new Error("Self-Signup is disabled in Legacy Cloud Mode.");
        }
        
        const profile = {
            username: userData.username,
            email:    userData.email || `${userData.username.toLowerCase()}@local.internal`,
            password: userData.password,
            passwordConfirm: userData.password,
            name:     userData.name,
            role:     'Auditor',
            restrictions: _.ALL_AUDITOR_RESTRICTIONS,
            settings: { theme: 'light', lowStockThreshold: 1000, isThresholdEnabled: false }
        };

        try {
            const userRec = await _.pb.collection('users').create(profile);
            await _.pb.collection('users').authWithPassword(profile.username, profile.password);
            
            _.currentUser = { ...userRec, uid: userRec.id };
            localStorage.setItem('cloudbased_session', JSON.stringify(_.currentUser));
            
            await Handler.addActivityLog({
                title: 'New Account Created',
                details: `Successful self-registration for ${userData.name} (@${userData.username}).`,
                category: 'user'
            }).catch(e => console.warn("Log failed:", e));

            return _.currentUser;
        } catch (e) {
            throw e;
        }
    };

    Handler.logout = function() {
        if (_.getMode() === 'FIREBASE') {
            window.FirebaseBridge.logout();
        } else if (_.pb) {
            _.pb.authStore.clear();
        }
        _.currentUser = null;
        localStorage.removeItem('cloudbased_session');
        location.reload();
    };

    Handler.updateProfile = async function(data) {
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') return _.currentUser;

        const updates = {
            name: data.name,
            username: data.username || _.currentUser.username,
            profilePicture: data.profilePicture
        };

        if (data.email !== undefined && data.email !== _.currentUser.email) {
            updates.email = data.email || `${updates.username.toLowerCase()}@local.internal`;
        }
        
        const updatedRec = await _.pb.collection('users').update(_.currentUser.uid, updates);

        _.currentUser = { ...updatedRec, uid: updatedRec.id };
        
        await Handler.addActivityLog({
            title: 'Profile Updated',
            details: `Modified personal account details and/or display name.`,
            category: 'user'
        });

        return _.currentUser;
    };

    Handler.changePassword = async function(oldPass, newPass) {
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') throw new Error("Manual password change not supported in Legacy Cloud Mode.");

        await _.pb.collection('users').update(_.currentUser.uid, {
            oldPassword: oldPass,
            password: newPass,
            passwordConfirm: newPass
        });

        await Handler.addActivityLog({
            title: 'Security Sync',
            details: 'User successfully updated their account password.',
            category: 'user'
        });
    };

    Handler.sendPasswordResetEmail = async function(identifier) {
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') {
            return window.FirebaseBridge.sendReset(identifier);
        }

        let emailToSend = identifier;
        if (!identifier.includes('@')) {
            const userRec = await _.pb.collection('users').getFirstListItem(`username="${identifier}"`).catch(() => null);
            if (!userRec) throw new Error("User not found.");
            emailToSend = userRec.email;
        }
        await _.pb.collection('users').requestPasswordReset(emailToSend);
    };

    Handler.confirmPasswordReset = async function(token, newPassword) {
        await _.initPromise;
        if (_.getMode() === 'FIREBASE') throw new Error("Reset link must be used in the original Firebase deployment.");
        await _.pb.collection('users').confirmPasswordReset(token, newPassword, newPassword);
    };

})(window.AppDataHandler);
