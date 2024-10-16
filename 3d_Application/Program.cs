using Microsoft.Extensions.FileProviders;
using Microsoft.AspNetCore.StaticFiles;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorPages();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseExceptionHandler("/Error");
    app.UseHsts();

}

app.UseHttpsRedirection();

// Serve static files
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "models_Object3d")),
    RequestPath = "/models_Object3d",
    ServeUnknownFileTypes = true,
    DefaultContentType = "application/octet-stream",
});

// Optionally add additional MIME types
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".gltf"] = "model/gltf+json";
provider.Mappings[".glb"] = "model/gltf-binary";
provider.Mappings[".bin"] = "application/octet-stream";

app.UseStaticFiles(new StaticFileOptions
{
    ContentTypeProvider = provider
});

app.UseRouting();
app.UseCors("AllowAll");
app.UseAuthorization();

app.MapRazorPages();
app.MapControllers();

app.Run();
