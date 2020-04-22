using System.Linq;
using <%= modelNamespace %>;

namespace ORC.Backend.Persistence
{
    public interface I<%= modelName %>Persistence
    {
        IQueryable<<%= modelName %>> List();

        <%= modelName %> Get(int id);

        void Add(<%= modelName %> data);

        void Update(<%= modelName %> data);

        void Delete(<%= modelName %> data);
    }
}
