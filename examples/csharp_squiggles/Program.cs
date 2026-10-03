// C# squiggles: every method here has one mistake that the C# extension underlines.
// Nothing to run. Open this file and try the squiggles:
// hover, the lightbulb, or Ctrl+Alt+E.

class Program
{
    static void Main()
    {
        ShowTotal();
    }

    int ShowTotal()
    {
        int total = 5;
        return totl;
    }

    static void Quantities()
    {
        int quantity = "3";
        double price = 2.25;
        int rounded = price;
        Console.WriteLine(quantity + rounded);
    }

    static double Discount(int quantity)
    {
        if (quantity >= 10)
        {
            return 0.1;
        }
    }

    static void Unassigned()
    {
        int count;
        Console.WriteLine(count);
    }

    static void NameLength()
    {
        string name = "Ada";
        Console.WriteLine(name.Lenght);
    }

    static void TwoTotals()
    {
        int total = 1;
        int total = 2;
        Console.WriteLine(total);
    }

    static double LineTotal(double price, int quantity)
    {
        return price * quantity;
    }

    static void WrongInputs()
    {
        Console.WriteLine(LineTotal(2.25));
        Console.WriteLine(Math.Max(1, 2, 3));
    }

    static void Receipt()
    {
        var text = new StringBuilder();
        text.Append("Thank you");
    }

    static bool IsAdult()
    {
        string age = "18";
        return age > 17;
    }

    static void CheckCount()
    {
        int count = 3;
        if (count = 5)
        {
            Console.WriteLine("Five");
        }
    }

    static void ReadName()
    {
        string name = Console.ReadLine();
        int age = int.Parse(Console.ReadLine());
        Console.WriteLine(name + age);
    }

    static void Nickname()
    {
        string? nickname = null;
        Console.WriteLine(nickname.Length);
    }
}
