import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState } from 'react'
import toast from 'react-hot-toast';
import { FcGoogle } from 'react-icons/fc';
import { auth } from '../firebase';
import { getUser, useLoginMutation } from '../redux/api/userAPI';
import { useDispatch } from 'react-redux';
import { userExist } from '../redux/reducer/userReducer';

const getErrorMessage = (error: unknown) => {
    if (typeof error === "object" && error !== null && "data" in error) {
        const data = (error as { data?: { message?: string } }).data;
        if (data?.message) return data.message;
    }

    return "Login Failed";
};

function login() {
    const [gender, setGender] = useState("");
    const [date, setDate] = useState("");
    const [isSigningIn, setIsSigningIn] = useState(false);

    const [login] = useLoginMutation();
    const dispatch = useDispatch();

    const loginHandler = async () =>{
        if (isSigningIn) return;

        if (!gender || !date) {
            toast.error("Please select gender and date of birth");
            return;
        }

        setIsSigningIn(true);

        try{
            const provider =  new GoogleAuthProvider();
            provider.setCustomParameters({ prompt: "select_account" });
            const { user } = await signInWithPopup(auth, provider);

            const res = await login({
                name:user.displayName!,
                email:user.email!,
                photo:user.photoURL!,
                gender,
                role:"user",
                dob: date,
                _id:user.uid,
            }).unwrap();

            const data = await getUser(user.uid);
            dispatch(userExist(data.user));
            toast.success(res.message);

        }
        catch(error){
            toast.error(getErrorMessage(error));
        } finally {
            setIsSigningIn(false);
        }
    }

  return (
    <div className='login'>
        <main>
            <h1 className='heading'>Login</h1>
            <div>
                    <label>Gender</label>
                    <select value={gender} onChange={(e) => setGender(e.target.value)}>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    </select>
            </div>

            <div>
                    <label>Date of Birth</label>
                     <input
                     type="date"
                     value={date}
                     onChange={(e) => setDate(e.target.value)}
                     />
            </div>

            <div>
                <p>Already Signed In Once</p>
                <button onClick={loginHandler} disabled={isSigningIn} aria-label="Sign in with Google">
                    <FcGoogle />
                </button>
                <span>Sign in with Google</span>
            </div>
                
        </main>
    </div>
  )
}

export default login
