using System;
using System.Linq;
using ORC.Contexts;
using <%= modelNamespace %>;

namespace ORC.Backend.Persistence.Database
{
    public class <%= modelName %>Persistence : I<%= modelName %>Persistence
    {
        private readonly DataContext m_Db;

        public <%= modelName %>Persistence(DataContext db)
        {
            m_Db = db ?? throw new ArgumentNullException("db");
        }

        public IQueryable<<%= modelName %>> List()
        {
            return m_Db.<%= modelPlural %>;
        }

        public <%= modelName %> Get(int id)
        {
            return m_Db.<%= modelPlural %>.Find(id);
        }

        public void Add(<%= modelName %> data)
        {
            m_Db.<%= modelPlural %>.Add(data);
            m_Db.SaveChanges();
        }

        public void Update(<%= modelName %> data)
        {
            m_Db.SaveChanges();
        }

        public void Delete(<%= modelName %> data)
        {
            m_Db.<%= modelPlural %>.Remove(data);
            m_Db.SaveChanges();
        }
    }
}