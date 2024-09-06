using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "models_Object3d")),
    RequestPath = "/models_Object3d",
    ServeUnknownFileTypes = true,  // Servir les fichiers inconnus (potentiellement utile)
    DefaultContentType = "model/gltf-binary"  // Définir le type MIME par défaut
});
;

app.UseRouting();

app.UseAuthorization();

app.MapRazorPages();

app.Run();
