using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace HotelBooking.Controllers
{
    public class BookingPreferenceViewModel
    {
        public string StayType { get; set; }   // Family / Friends
        public bool HasPet { get; set; }
        public bool WantsAC { get; set; }
        public bool WantsBreakfast { get; set; }
        public bool WantsLunch { get; set; }
    }

}