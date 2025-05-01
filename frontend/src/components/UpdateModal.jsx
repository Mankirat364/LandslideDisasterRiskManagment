import React, { useState } from 'react';
import { toast } from 'react-hot-toast'; 
import axios from 'axios';
import { useDispatch, useSelector } from "react-redux"
const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const UpdateModal = () => {
      const dispatch = useDispatch();
      const baseUrl = useSelector((state) => state.base.baseUrl);
    const [resetFormData, setResetFormData] = useState({
        email: '',
        fullName: '',
        password: '',
    });

    const [passwordValid, setPasswordValid] = useState({
        length: false,
        specialChar: false,
        number: false,
    });

    const [emailValid, setEmailValid] = useState(false);

    const validatePassword = (password) => {
        setPasswordValid({
            length: password.length >= 8,
            specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            number: /\d/.test(password),
        });
    };

    const validateEmail = (email) => {
        setEmailValid(emailRegex.test(email));
    };

    const handlePasswordChange = (e) => {
        const password = e.target.value;
        setResetFormData({ ...resetFormData, password });
        validatePassword(password);
    };

    const handleEmailChange = (e) => {
        const email = e.target.value;
        setResetFormData({ ...resetFormData, email });
        validateEmail(email);
    };

    const handleFormSubmit = async () => {
        const { email, fullName, password } = resetFormData;

        if (email && !emailValid) {
            toast.error('Please enter a valid email address.');
            return;
        }

        if (password && (!passwordValid.length || !passwordValid.specialChar || !passwordValid.number)) {
            toast.error(
                'Password must be at least 8 characters long, contain a special character, and include a number.'
            );
            return;
        }

        if (!email && !fullName && !password) {
            toast.error('Please fill in at least one field to update.');
            return;
        }

        try {
            const res = await axios.put(`${baseUrl}/api/auth/updateAccount`, resetFormData, {
                withCredentials: true,
            });
            toast.success(res.data.message || 'User updated successfully');
            
            document.getElementById('reset-modal').checked = false;
            setResetFormData({ email: '', fullName: '', password: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Error updating user');
            console.error(err);
        }
    };

    return (
        <div>
            <input type="checkbox" id="reset-modal" className="modal-toggle" />
            <div className="modal">
                <div className="modal-box w-full max-w-lg">
                    <h3 className="font-bold text-2xl mb-4 text-center">Reset Your Details</h3>

                    <div className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Email</span>
                            </label>
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className={`input input-bordered w-full ${emailValid || !resetFormData.email ? 'border-gray-300' : 'border-red-500'}`}
                                value={resetFormData.email}
                                onChange={handleEmailChange}
                            />
                            {!emailValid && resetFormData.email && (
                                <p className="text-red-500 text-sm">Please enter a valid email address.</p>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Full Name</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter your full name"
                                className="input input-bordered w-full"
                                value={resetFormData.fullName}
                                onChange={(e) =>
                                    setResetFormData({ ...resetFormData, fullName: e.target.value })
                                }
                            />
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">New Password</span>
                            </label>
                            <input
                                type="password"
                                placeholder="Enter new password"
                                className="input input-bordered w-full"
                                value={resetFormData.password}
                                onChange={handlePasswordChange}
                            />
                            {resetFormData.password && (
                                <div className="mt-2 text-sm text-gray-500">
                                    <p
                                        className={`${
                                            passwordValid.length ? 'text-green-500' : 'text-red-500'
                                        }`}
                                    >
                                        Minimum 8 characters
                                    </p>
                                    <p
                                        className={`${
                                            passwordValid.specialChar ? 'text-green-500' : 'text-red-500'
                                        }`}
                                    >
                                        At least one special character (!, @, #, $, etc.)
                                    </p>
                                    <p
                                        className={`${
                                            passwordValid.number ? 'text-green-500' : 'text-red-500'
                                        }`}
                                    >
                                        At least one number
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-action">
                        <label htmlFor="reset-modal" className="btn">
                            Cancel
                        </label>
                        <button
                            className="btn btn-primary"
                            onClick={handleFormSubmit}
                        >
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpdateModal;
