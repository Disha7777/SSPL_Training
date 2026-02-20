using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

public class Booking
{
    public int BookingId { get; set; }
    public string RoomType { get; set; }
    public DateTime CheckInDate { get; set; }
    public DateTime CheckOutDate { get; set; }
}
