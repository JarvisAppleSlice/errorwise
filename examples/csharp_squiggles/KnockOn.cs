// Knock-on errors: one typo on line 17 causes eight more squiggles after it.
// Hover over `Id` or `Description`: the panel should say to check line 17 first,
// and its Reference line button should jump to `nnew`.

public class Product
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public decimal Price { get; set; }
    public string Description { get; set; } = "";
}

public static class Catalog
{
    private static readonly List<Product> Products = new List<Product>
        {
            nnew Product
            {
                Id = 1,
                Name = "Product 1",
                Price = 10.99m,
                Description = "Description for Product 1",
            }

        };

    public static int Count() => Products.Count;
}
