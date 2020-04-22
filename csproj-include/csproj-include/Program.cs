using Microsoft.Build.Evaluation;
using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using Newtonsoft.Json;
using System.Text;
using System.Threading.Tasks;
using csproj_include.Models;

namespace csproj_include
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length > 1)
            {
                var projectFile = args[0];

                if (!string.IsNullOrWhiteSpace(projectFile))
                {
                    var itemsJson = args[1];

                    try
                    {
                        var items = JsonConvert.DeserializeObject<List<Item>>(itemsJson);
                        var executableDir = Directory.GetParent(Path.GetDirectoryName(System.Reflection.Assembly.GetExecutingAssembly().Location));
                        var projectFullPath = $"{executableDir}\\{projectFile}";

                        var glob = new Dictionary<string, string>();
                        glob.Add("VisualStudioVersion", "16.0");
                        glob.Add("MSBuildExtensionsPath32", @"C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\MSBuild");

                        var p = ProjectCollection.GlobalProjectCollection.LoadedProjects.FirstOrDefault(x => x.FullPath == projectFullPath);
                        if (p == null)
                            p = new Project(projectFullPath, glob, null);

                        if (p != null)
                        {
                            items.Where(x => x.filename != null).ToList().ForEach(x =>
                            {
                                p.AddItemFast(x.itemType, x.filename, x.metadata);
                                Console.WriteLine($"--> Included {x.filename}");
                            });

                            p.Save();

                            Console.WriteLine("Success");
                        }
                        else
                        {
                            Console.WriteLine("No project loaded");
                        }
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine(ex.Message);
                    }
                }
                else
                {
                    throw new ArgumentException("First argument should not be empty");
                }
            } 
            else
            {                
                throw new ArgumentException("Expected arguments");
            }
        }
    }
}
