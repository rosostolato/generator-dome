using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace csproj_include.Models
{
    class Item
    {
        public string itemType { get; set; }
        public string filename { get; set; }
        public Dictionary<string, string> metadata { get; set; }
    }
}
