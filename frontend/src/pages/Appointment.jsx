// src/pages/Appointment.jsx

import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { FaMapMarkerAlt, FaUserMd, FaGraduationCap, FaMoneyBillWave } from 'react-icons/fa';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import Spinner from '../components/Spinner';
import { toast } from 'react-toastify';

const localizer = momentLocalizer(moment);

const ALL_TIME_SLOTS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'
];

const Appointment = () => {
    const { docId } = useParams();
    const navigate = useNavigate();
    const { token, backendurl } = useContext(AppContext);

    if (!docId) {
        return <div className="text-center p-8 text-red-600 font-bold">Invalid doctor link. No doctor ID provided.</div>;
    }

    const [doctor, setDoctor] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [selectedSlot, setSelectedSlot] = useState('');
    const [bookedSlots, setBookedSlots] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [booking, setBooking] = useState(false);

    useEffect(() => {
        const getDoctorDetails = async () => {
            try {
                const { data } = await axios.get(`${backendurl}/api/doctor/${docId}`);
                if (data.success) {
                    setDoctor(data.data);
                }
            } catch (error) {
                console.error("Error fetching doctor details:", error);
                toast.error("Failed to load doctor details.");
            } finally {
                setLoading(false);
            }
        };
        getDoctorDetails();
    }, [docId, backendurl]);

    useEffect(() => {
        const getAvailability = async () => {
            if (!selectedDate) return;
            try {
                const dateStr = moment(selectedDate).format('YYYY-MM-DD');
                const { data } = await axios.get(`${backendurl}/api/doctor/availability/${docId}?date=${dateStr}`);
                if (data.success) {
                    setBookedSlots(data.data);
                }
            } catch (error) {
                console.error("Error fetching availability:", error);
                toast.error("Could not fetch availability for this date.");
            }
        };
        getAvailability();
    }, [selectedDate, docId, backendurl]);

    useEffect(() => {
        setAvailableSlots(ALL_TIME_SLOTS.filter(slot => !bookedSlots.includes(slot)));
    }, [bookedSlots]);

    const handleBooking = async () => {
        if (!selectedSlot) {
            return toast.error("Please select a time slot.");
        }
        if (!token) {
            return toast.error("Please log in to book an appointment.", { onclose: () => navigate('/login') });
        }
        setBooking(true);
        try {
            const { data } = await axios.post(`${backendurl}/api/user/book-appointment`, {
                docId: doctor._id,
                slotDate: moment(selectedDate).format('YYYY-MM-DD'),
                slotTime: selectedSlot,
                amount: doctor.fees
            });

            if (data.success) {
                toast.success(data.message);
                navigate('/my-appointments');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error("Booking failed. Please try again.");
            console.error("Booking Error:", error);
        } finally {
            setBooking(false);
        }
    };

    if (loading) return <Spinner />;
    if (!doctor) return <div className="text-center p-8">Doctor not found.</div>;
    
    const calendarEvents = bookedSlots.map(slot => {
        const timeParts = moment(slot, 'hh:mm A').toObject();
        const start = moment(selectedDate).set({ hours: timeParts.hours, minutes: timeParts.minutes }).toDate();
        const end = moment(start).add(30, 'minutes').toDate();
        return { title: 'Booked', start, end };
    });

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden md:flex">
                <div className="md:w-1/3 p-6 bg-gradient-to-r from-blue-500 to-teal-400 text-white">
                    <img src={doctor.image} alt={doctor.fullName} className="w-32 h-32 rounded-full mx-auto border-4 border-white shadow-lg" />
                    <h1 className="text-3xl font-bold text-center mt-4">{doctor.fullName}</h1>
                    <p className="text-center text-blue-100">{doctor.specialization}</p>
                    <div className="mt-6 space-y-3">
                        <p className="flex items-center"><FaGraduationCap className="mr-3" /> {doctor.degree}</p>
                        <p className="flex items-center"><FaUserMd className="mr-3" /> {doctor.experience} years of experience</p>
                        <p className="flex items-center"><FaMapMarkerAlt className="mr-3" /> {doctor.address}</p>
                        <p className="flex items-center text-2xl font-bold"><FaMoneyBillWave className="mr-3" /> ₹{doctor.fees} per session</p>
                    </div>
                </div>

                <div className="md:w-2/3 p-6">
                    <h2 className="text-2xl font-bold mb-4 text-gray-800">Book Your Slot</h2>
                    
                    <div style={{ height: '500px' }}>
                        <Calendar
                            localizer={localizer}
                            events={calendarEvents}
                            startAccessor="start"
                            endAccessor="end"
                            defaultView="month"
                            views={['month', 'week', 'day']}
                            onNavigate={date => setSelectedDate(date)}
                            onSelectSlot={({ start }) => setSelectedDate(start)}
                            selectable
                            min={new Date()} // Prevent booking past dates
                        />
                    </div>

                    <div className="mt-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-3">
                            Available Slots for <span className="text-blue-600">{moment(selectedDate).format('MMMM Do, YYYY')}</span>
                        </h3>
                        {availableSlots.length > 0 ? (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                {availableSlots.map(slot => (
                                    <button
                                        key={slot}
                                        onClick={() => setSelectedSlot(slot)}
                                        className={`p-2 rounded-lg text-center font-semibold transition-all duration-200 ${selectedSlot === slot ? 'bg-blue-600 text-white shadow-lg' : 'bg-gray-200 text-gray-800 hover:bg-blue-200'}`}
                                    >
                                        {slot}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500">No available slots for this day. Please select another date.</p>
                        )}
                    </div>
                    
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleBooking}
                            disabled={booking || !selectedSlot}
                            className="w-full md:w-auto bg-green-500 text-white font-bold py-3 px-12 rounded-lg hover:bg-green-600 disabled:bg-gray-400 transition-colors duration-300"
                        >
                            {booking ? 'Booking...' : 'Confirm Appointment'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Appointment;
