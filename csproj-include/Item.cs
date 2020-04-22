using System;
using System.Collections.Generic;
using System.Text;

namespace csproj_include
{
    class Item
    {
        public string itemType { get; set; }
        public string unevaluatedInclude { get; set; }
        public Dictionary<string, string> metadata { get; set; }
    }
}
