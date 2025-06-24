// src/pages/Appointment.jsx

import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaMapMarkerAlt, FaUserMd, FaGraduationCap, FaMoneyBillWave } from 'react-icons/fa';

const Appointment = () => {
  const daysofweek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const { docId } = useParams();
  const { doctors, backendurl, token } = useContext(AppContext);

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [groupedSlots, setGroupedSlots] = useState({});
  const [selectedSlot, setSelectedSlot] = useState(null);

  const navigate = useNavigate();

  // Fetch doctor info
  useEffect(() => {
    if (doctors.length > 0) {
      const found = doctors.find(d => d._id === docId);
      setDocInfo(found || null);
    }
  }, [doctors, docId]);

  // Generate slots
  useEffect(() => {
    if (!docInfo) return;

    const generateSlots = () => {
      const allSlots = [];
      const today = new Date();

      for (let i = 0; i < 7; i++) {
        const currDate = new Date(today);
        currDate.setDate(currDate.getDate() + i);

        const endTime = new Date(currDate);
        endTime.setHours(21, 0, 0, 0);

        if (currDate.toDateString() === today.toDateString()) {
          const minutes = today.getMinutes();
          if (minutes < 30) {
            currDate.setHours(today.getHours(), 30, 0, 0);
          } else {
            currDate.setHours(today.getHours() + 1, 0, 0, 0);
          }
        } else {
          currDate.setHours(10, 0, 0, 0);
        }

        while (currDate < endTime) {
          const timestr = currDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          allSlots.push({
            date: new Date(currDate),
            time: timestr,
          });
          currDate.setMinutes(currDate.getMinutes() + 30);
        }
      }
      return allSlots;
    };

    setDocSlots(generateSlots());
  }, [docInfo]);

  // Group slots by date
  useEffect(() => {
    if (docSlots.length === 0) {
      setGroupedSlots({});
      return;
    }
    const groups = {};
    docSlots.forEach((slot) => {
      const year = slot.date.getFullYear();
      const month = (slot.date.getMonth() + 1).toString().padStart(2, '0');
      const day = slot.date.getDate().toString().padStart(2, '0');
      const key = `${year}-${month}-${day}`;
      if (!groups[key]) {
        const dayLabel = daysofweek[slot.date.getDay()];
        const monthName = slot.date.toLocaleString('default', { month: 'short' });
        const dateLabel = `${dayLabel}, ${monthName} ${slot.date.getDate()}`;
        groups[key] = { label: dateLabel, slots: [] };
      }
      groups[key].slots.push(slot);
    });
    setGroupedSlots(groups);
  }, [docSlots]);

  if (!docInfo) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-400"></div>
    </div>
  );

  const bookAppointment = async () => {
    if (!selectedSlot) {
      toast.info("Please select a slot", { position: "top-center", theme: "colored" });
      return;
    }
    if (!token) {
      toast.warning("Please login to book an appointment", { position: "top-center", theme: "colored" });
      return navigate("/login");
    }
    try {
      const date = selectedSlot.date;
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const year = date.getFullYear();
      const slotDate = day + "_" + month + "_" + year;
      const userId = localStorage.getItem("userId");
      const { data } = await axios.post(`${backendurl}/api/user/book-appointment`, {
        userId, docId, slotDate, slotTime: selectedSlot.time
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        toast.success("Appointment Booked Successfully!", { position: "top-center", theme: "colored", autoClose: 2000 });
        navigate("/my-appointments");
      } else {
        toast.error(data.message, { position: "top-center", theme: "colored" });
      }
    } catch (err) {
      toast.error("Oh no, something went wrong!", { position: "top-center", theme: "colored" });
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 py-10 px-2 flex flex-col items-center w-full">
      {/* Doctor Info */}
      <div className="w-full max-w-4xl flex flex-col md:flex-row items-center md:items-start gap-8 p-8 mt-10 bg-white rounded-2xl shadow-2xl border border-blue-100">
        <img
          src={docInfo.image}
          alt={docInfo.name}
          className="w-40 h-40 rounded-full object-cover border-4 border-teal-200 shadow-lg mx-auto md:mx-0"
        />
        <div className="flex-1 flex flex-col items-center md:items-start">
          <h1 className="text-3xl md:text-4xl font-bold text-blue-900 mb-1">{docInfo.fullName}</h1>
          <div className="flex items-center gap-2 text-lg mb-2">
            <FaUserMd className="text-teal-500" />
            <span className="text-teal-700 font-medium">{docInfo.speciality}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 mb-1">
            <FaGraduationCap className="text-blue-400" />
            <span>{docInfo.degree} • {docInfo.experience}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-700 mb-1">
            <FaMoneyBillWave className="text-orange-400" />
            <span className="font-semibold text-orange-600">₹{docInfo.fees} Consultation Fee</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600 mt-2">
            <FaMapMarkerAlt className="text-blue-400" />
            <span>
              {docInfo.address}
            </span>
          </div>
          <div className="mt-4 text-sm text-gray-700 italic text-center md:text-left">
            {docInfo.about}
          </div>
        </div>
      </div>

      {/* Slots Section */}
      <div className="w-full max-w-4xl mt-8 p-8 bg-blue-50 rounded-2xl shadow-xl border border-blue-100">
        <h2 className="text-2xl font-bold text-teal-700 mb-6 text-center">Available Slots</h2>
        {Object.keys(groupedSlots).length === 0 ? (
          <p className="text-gray-500 text-center">No slots available.</p>
        ) : (
          <div className="flex flex-col gap-8">
            {Object.entries(groupedSlots).map(([dateKey, info]) => (
              <div key={dateKey}>
                <h3 className="mb-3 text-blue-700 font-semibold text-lg text-center">{info.label}</h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {info.slots.map((slotObj, idx) => {
                    const slotIdentifier = `${dateKey}-${slotObj.time}`;
                    const isSelected =
                      selectedSlot &&
                      selectedSlot.date.toDateString() === slotObj.date.toDateString() &&
                      selectedSlot.time === slotObj.time;
                    return (
                      <button
                        key={slotIdentifier}
                        onClick={() => setSelectedSlot(slotObj)}
                        className={`px-5 py-2 rounded-lg font-semibold shadow transition border-2 text-base
                          ${isSelected ? 'bg-teal-500 text-white border-teal-600 scale-105' : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-400'}
                        `}
                      >
                        {slotObj.time}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Selected Slot Summary & Book Button */}
      <div className="w-full max-w-4xl mt-8 flex flex-col md:flex-row items-center gap-6">
        {selectedSlot && (
          <div className="flex-1 bg-white rounded-xl shadow-lg border border-teal-100 p-6 flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold text-teal-700 mb-2">Selected Slot</h3>
            <div className="text-blue-800 font-semibold text-base mb-1">
              {selectedSlot.date.toLocaleDateString()} at {selectedSlot.time}
            </div>
          </div>
        )}
        <button
          onClick={bookAppointment}
          className="px-10 py-4 bg-orange-500 text-white rounded-xl font-bold shadow-lg hover:bg-orange-600 transition text-xl w-full md:w-auto"
        >
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default Appointment;
