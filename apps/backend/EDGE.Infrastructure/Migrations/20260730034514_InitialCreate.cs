using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EDGE.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.CreateTable(
                name: "ActivityLogs",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ActivityType = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    UserId = table.Column<string>(type: "text", nullable: false),
                    IpAddress = table.Column<string>(type: "text", nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActivityLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AuditLogs",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    EntityName = table.Column<string>(type: "text", nullable: false),
                    Action = table.Column<string>(type: "text", nullable: false),
                    ChangedBy = table.Column<string>(type: "text", nullable: true),
                    ChangedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    KeyValues = table.Column<string>(type: "text", nullable: true),
                    OldValues = table.Column<string>(type: "text", nullable: true),
                    NewValues = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuditLogs", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Feedbacks",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderName = table.Column<string>(type: "text", nullable: false),
                    SenderEmail = table.Column<string>(type: "text", nullable: false),
                    Subject = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    IsAnonymous = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Feedbacks", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Fees",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fees", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Fields",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FieldType = table.Column<string>(type: "text", nullable: false),
                    Label = table.Column<string>(type: "text", nullable: false),
                    ValidationRules = table.Column<string>(type: "text", nullable: true),
                    IsOtherEnabled = table.Column<bool>(type: "boolean", nullable: false),
                    SyncBackOnSubmit = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Fields", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Notes",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Notes = table.Column<string>(type: "text", nullable: false),
                    ServiceCategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Regions",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Regions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Requirements",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Requirements", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ServiceCategories",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Code = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceCategories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "SystemAnnouncements",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    TargetAudience = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemAnnouncements", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    AuthUserId = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "text", nullable: false),
                    LastName = table.Column<string>(type: "text", nullable: false),
                    IsSuperAdmin = table.Column<bool>(type: "boolean", nullable: false),
                    BarangayId = table.Column<Guid>(type: "uuid", nullable: true),
                    MiddleName = table.Column<string>(type: "text", nullable: true),
                    Suffix = table.Column<string>(type: "text", nullable: true),
                    Unit = table.Column<string>(type: "text", nullable: true),
                    Street = table.Column<string>(type: "text", nullable: true),
                    ZipCode = table.Column<string>(type: "text", nullable: true),
                    ContactNumber = table.Column<string>(type: "text", nullable: true),
                    DateOfBirth = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    Sex = table.Column<string>(type: "text", nullable: true),
                    Nationality = table.Column<string>(type: "text", nullable: true),
                    Height = table.Column<float>(type: "real", nullable: true),
                    Weight = table.Column<float>(type: "real", nullable: true),
                    SchoolAttended = table.Column<string>(type: "text", nullable: true),
                    CourseTaken = table.Column<string>(type: "text", nullable: true),
                    ProfilePicture = table.Column<string>(type: "text", nullable: true),
                    IsOnline = table.Column<bool>(type: "boolean", nullable: true),
                    LastOnline = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ESignature = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Provinces",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RegionId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Provinces", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Provinces_Regions_RegionId",
                        column: x => x.RegionId,
                        principalSchema: "public",
                        principalTable: "Regions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Tenants",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    RegionId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Tenants_Regions_RegionId",
                        column: x => x.RegionId,
                        principalSchema: "public",
                        principalTable: "Regions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Municipalities",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ProvinceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Municipalities", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Municipalities_Provinces_ProvinceId",
                        column: x => x.ProvinceId,
                        principalSchema: "public",
                        principalTable: "Provinces",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsSystemRole = table.Column<bool>(type: "boolean", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Key = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Roles_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Services",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceCategoryId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    Group = table.Column<string>(type: "text", nullable: true),
                    Code = table.Column<string>(type: "text", nullable: true),
                    Description = table.Column<string>(type: "text", nullable: true),
                    Contract = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Services", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Services_ServiceCategories_ServiceCategoryId",
                        column: x => x.ServiceCategoryId,
                        principalSchema: "public",
                        principalTable: "ServiceCategories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Services_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "StoredFiles",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FileName = table.Column<string>(type: "text", nullable: false),
                    ContentType = table.Column<string>(type: "text", nullable: false),
                    FileSizeBytes = table.Column<long>(type: "bigint", nullable: false),
                    StorageKey = table.Column<string>(type: "text", nullable: false),
                    Category = table.Column<string>(type: "text", nullable: false),
                    EncryptionIv = table.Column<string>(type: "text", nullable: false),
                    EncryptionTag = table.Column<string>(type: "text", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UploadedByUserId = table.Column<string>(type: "text", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StoredFiles", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StoredFiles_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Barangays",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    MunicipalityId = table.Column<Guid>(type: "uuid", nullable: false),
                    Code = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    Name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Barangays", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Barangays_Municipalities_MunicipalityId",
                        column: x => x.MunicipalityId,
                        principalSchema: "public",
                        principalTable: "Municipalities",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    PermissionKey = table.Column<string>(type: "text", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "public",
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ExaminationSchedules",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    ExamDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Venue = table.Column<string>(type: "text", nullable: false),
                    MaxSlots = table.Column<int>(type: "integer", nullable: false),
                    AvailableSlots = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ExaminationSchedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ExaminationSchedules_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalSchema: "public",
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Forms",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Version = table.Column<string>(type: "text", nullable: false),
                    CategorySelectionRequired = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Forms", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Forms_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalSchema: "public",
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Schedules",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Venue = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    StartDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    EndDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    StartApplication = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EndApplication = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    IsPublished = table.Column<bool>(type: "boolean", nullable: false, defaultValue: false),
                    MaximumSlots = table.Column<int>(type: "integer", nullable: true),
                    Remarks = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Schedules", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Schedules_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalSchema: "public",
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Schedules_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceFees",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    FeeId = table.Column<Guid>(type: "uuid", nullable: false),
                    Amount = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceFees", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceFees_Fees_FeeId",
                        column: x => x.FeeId,
                        principalSchema: "public",
                        principalTable: "Fees",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceFees_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalSchema: "public",
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ServiceVariants",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceId = table.Column<Guid>(type: "uuid", nullable: false),
                    Type = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceVariants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceVariants_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalSchema: "public",
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CompanyDetails",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BarangayId = table.Column<Guid>(type: "uuid", nullable: false),
                    Address = table.Column<string>(type: "text", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    RegistrationNumber = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    ContactNumber = table.Column<string>(type: "text", nullable: false),
                    Email = table.Column<string>(type: "text", nullable: true),
                    EntityType = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CompanyDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CompanyDetails_Barangays_BarangayId",
                        column: x => x.BarangayId,
                        principalSchema: "public",
                        principalTable: "Barangays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FormSections",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    FormId = table.Column<Guid>(type: "uuid", nullable: false),
                    Key = table.Column<string>(type: "text", nullable: false),
                    Title = table.Column<string>(type: "text", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormSections", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormSections_Forms_FormId",
                        column: x => x.FormId,
                        principalSchema: "public",
                        principalTable: "Forms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Applications",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ScheduleId = table.Column<Guid>(type: "uuid", nullable: true),
                    RegionId = table.Column<Guid>(type: "uuid", nullable: true),
                    Office = table.Column<string>(type: "text", nullable: true),
                    ApplicationNumber = table.Column<string>(type: "text", nullable: true),
                    ReferenceNumber = table.Column<string>(type: "text", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    SubmissionMode = table.Column<string>(type: "text", nullable: false),
                    DataEntryMethod = table.Column<string>(type: "text", nullable: true),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsGuest = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Applications_Regions_RegionId",
                        column: x => x.RegionId,
                        principalSchema: "public",
                        principalTable: "Regions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Applications_Schedules_ScheduleId",
                        column: x => x.ScheduleId,
                        principalSchema: "public",
                        principalTable: "Schedules",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Applications_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Applications_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ServiceVariantRequirements",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    RequirementId = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceVariantId = table.Column<Guid>(type: "uuid", nullable: false),
                    ContextKey = table.Column<string>(type: "text", nullable: true),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ServiceVariantRequirements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ServiceVariantRequirements_Requirements_RequirementId",
                        column: x => x.RequirementId,
                        principalSchema: "public",
                        principalTable: "Requirements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ServiceVariantRequirements_ServiceVariants_ServiceVariantId",
                        column: x => x.ServiceVariantId,
                        principalSchema: "public",
                        principalTable: "ServiceVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApplicantDetails",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    BarangayId = table.Column<Guid>(type: "uuid", nullable: true),
                    CompanyDetailId = table.Column<Guid>(type: "uuid", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: false),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    MiddleName = table.Column<string>(type: "text", nullable: true),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Suffix = table.Column<string>(type: "text", nullable: true),
                    Nationality = table.Column<string>(type: "text", nullable: false),
                    Sex = table.Column<string>(type: "text", nullable: false),
                    Height = table.Column<double>(type: "double precision", nullable: true),
                    Weight = table.Column<double>(type: "double precision", nullable: true),
                    BirthDate = table.Column<DateOnly>(type: "date", nullable: false),
                    EmailAddress = table.Column<string>(type: "text", nullable: true),
                    ContactNumber = table.Column<string>(type: "text", nullable: false),
                    ZipCode = table.Column<string>(type: "text", nullable: true),
                    SchoolAttended = table.Column<string>(type: "text", nullable: true),
                    CourseTaken = table.Column<string>(type: "text", nullable: true),
                    YearGraduated = table.Column<string>(type: "text", nullable: true),
                    ESignature = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicantDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicantDetails_Barangays_BarangayId",
                        column: x => x.BarangayId,
                        principalSchema: "public",
                        principalTable: "Barangays",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ApplicantDetails_CompanyDetails_CompanyDetailId",
                        column: x => x.CompanyDetailId,
                        principalSchema: "public",
                        principalTable: "CompanyDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "SectionFields",
                schema: "public",
                columns: table => new
                {
                    FormSectionId = table.Column<Guid>(type: "uuid", nullable: false),
                    FieldId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsRequired = table.Column<bool>(type: "boolean", nullable: false),
                    OrderIndex = table.Column<int>(type: "integer", nullable: false),
                    VisibilityCondition = table.Column<string>(type: "text", nullable: true),
                    Id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SectionFields", x => new { x.FormSectionId, x.FieldId });
                    table.ForeignKey(
                        name: "FK_SectionFields_Fields_FieldId",
                        column: x => x.FieldId,
                        principalSchema: "public",
                        principalTable: "Fields",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_SectionFields_FormSections_FormSectionId",
                        column: x => x.FormSectionId,
                        principalSchema: "public",
                        principalTable: "FormSections",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationServices",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceCategoryId = table.Column<Guid>(type: "uuid", nullable: true),
                    ServiceId = table.Column<Guid>(type: "uuid", nullable: true),
                    ServiceVariantId = table.Column<Guid>(type: "uuid", nullable: true),
                    ApplicationTypeKey = table.Column<string>(type: "text", nullable: true),
                    DynamicDataJson = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationServices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationServices_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationServices_ServiceCategories_ServiceCategoryId",
                        column: x => x.ServiceCategoryId,
                        principalSchema: "public",
                        principalTable: "ServiceCategories",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApplicationServices_ServiceVariants_ServiceVariantId",
                        column: x => x.ServiceVariantId,
                        principalSchema: "public",
                        principalTable: "ServiceVariants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ApplicationServices_Services_ServiceId",
                        column: x => x.ServiceId,
                        principalSchema: "public",
                        principalTable: "Services",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationStatusHistories",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    Status = table.Column<string>(type: "text", nullable: false),
                    Remarks = table.Column<string>(type: "text", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationStatusHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationStatusHistories_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationStatusHistories_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateTable(
                name: "Applicants",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: true),
                    IsGuest = table.Column<bool>(type: "boolean", nullable: false),
                    ApplicantType = table.Column<string>(type: "text", nullable: false),
                    ApplicantDetailId = table.Column<Guid>(type: "uuid", nullable: true),
                    CompanyDetailId = table.Column<Guid>(type: "uuid", nullable: true),
                    Status = table.Column<string>(type: "text", nullable: false),
                    EvaluationRemarks = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Applicants", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Applicants_ApplicantDetails_ApplicantDetailId",
                        column: x => x.ApplicantDetailId,
                        principalSchema: "public",
                        principalTable: "ApplicantDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Applicants_CompanyDetails_CompanyDetailId",
                        column: x => x.CompanyDetailId,
                        principalSchema: "public",
                        principalTable: "CompanyDetails",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Applicants_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Applicants_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationApplicants",
                schema: "public",
                columns: table => new
                {
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicantId = table.Column<Guid>(type: "uuid", nullable: false),
                    SequenceOrder = table.Column<int>(type: "integer", nullable: false),
                    Id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationApplicants", x => new { x.ApplicationId, x.ApplicantId });
                    table.ForeignKey(
                        name: "FK_ApplicationApplicants_Applicants_ApplicantId",
                        column: x => x.ApplicantId,
                        principalSchema: "public",
                        principalTable: "Applicants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationApplicants_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ApplicationRequirements",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicantId = table.Column<Guid>(type: "uuid", nullable: false),
                    RequirementId = table.Column<Guid>(type: "uuid", nullable: false),
                    ServiceVariantRequirementId = table.Column<Guid>(type: "uuid", nullable: true),
                    StoredFileId = table.Column<Guid>(type: "uuid", nullable: true),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Url = table.Column<string>(type: "text", nullable: false),
                    IsApproved = table.Column<bool>(type: "boolean", nullable: false),
                    ApprovedBy = table.Column<string>(type: "text", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ApplicationRequirements", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ApplicationRequirements_Applicants_ApplicantId",
                        column: x => x.ApplicantId,
                        principalSchema: "public",
                        principalTable: "Applicants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationRequirements_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationRequirements_Requirements_RequirementId",
                        column: x => x.RequirementId,
                        principalSchema: "public",
                        principalTable: "Requirements",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ApplicationRequirements_ServiceVariantRequirements_ServiceV~",
                        column: x => x.ServiceVariantRequirementId,
                        principalSchema: "public",
                        principalTable: "ServiceVariantRequirements",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApplicationRequirements_StoredFiles_StoredFileId",
                        column: x => x.StoredFileId,
                        principalSchema: "public",
                        principalTable: "StoredFiles",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ApplicationRequirements_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FormSubmissions",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicationId = table.Column<Guid>(type: "uuid", nullable: false),
                    FormId = table.Column<Guid>(type: "uuid", nullable: false),
                    ApplicantId = table.Column<Guid>(type: "uuid", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormSubmissions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FormSubmissions_Applicants_ApplicantId",
                        column: x => x.ApplicantId,
                        principalSchema: "public",
                        principalTable: "Applicants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FormSubmissions_Applications_ApplicationId",
                        column: x => x.ApplicationId,
                        principalSchema: "public",
                        principalTable: "Applications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FormSubmissions_Forms_FormId",
                        column: x => x.FormId,
                        principalSchema: "public",
                        principalTable: "Forms",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "FormFieldValues",
                schema: "public",
                columns: table => new
                {
                    FormSubmissionId = table.Column<Guid>(type: "uuid", nullable: false),
                    FieldId = table.Column<Guid>(type: "uuid", nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false),
                    Id = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FormFieldValues", x => new { x.FormSubmissionId, x.FieldId });
                    table.ForeignKey(
                        name: "FK_FormFieldValues_Fields_FieldId",
                        column: x => x.FieldId,
                        principalSchema: "public",
                        principalTable: "Fields",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_FormFieldValues_FormSubmissions_FormSubmissionId",
                        column: x => x.FormSubmissionId,
                        principalSchema: "public",
                        principalTable: "FormSubmissions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "FieldOffices",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    Code = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Category = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false, defaultValue: "Main"),
                    Description = table.Column<string>(type: "text", nullable: true),
                    RegionId = table.Column<Guid>(type: "uuid", nullable: false),
                    ProvinceId = table.Column<Guid>(type: "uuid", nullable: true),
                    Address = table.Column<string>(type: "text", nullable: false),
                    ContactPhone = table.Column<string>(type: "text", nullable: false),
                    ContactEmail = table.Column<string>(type: "text", nullable: false),
                    OfficerInChargeId = table.Column<Guid>(type: "uuid", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    AllowSpectrumInspection = table.Column<bool>(type: "boolean", nullable: false),
                    AllowPermitIssuance = table.Column<bool>(type: "boolean", nullable: false),
                    AllowComplaintReception = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FieldOffices", x => x.Id);
                    table.ForeignKey(
                        name: "FK_FieldOffices_Provinces_ProvinceId",
                        column: x => x.ProvinceId,
                        principalSchema: "public",
                        principalTable: "Provinces",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_FieldOffices_Regions_RegionId",
                        column: x => x.RegionId,
                        principalSchema: "public",
                        principalTable: "Regions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_FieldOffices_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "TenantMembers",
                schema: "public",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    TenantId = table.Column<Guid>(type: "uuid", nullable: false),
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    RoleId = table.Column<Guid>(type: "uuid", nullable: false),
                    FieldOfficeId = table.Column<Guid>(type: "uuid", nullable: true),
                    JobTitle = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Level = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    Division = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Position = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Designation = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CreatedBy = table.Column<string>(type: "text", nullable: true),
                    LastModifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    LastModifiedBy = table.Column<string>(type: "text", nullable: true),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false),
                    IsDeletedBy = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantMembers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TenantMembers_FieldOffices_FieldOfficeId",
                        column: x => x.FieldOfficeId,
                        principalSchema: "public",
                        principalTable: "FieldOffices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TenantMembers_Roles_RoleId",
                        column: x => x.RoleId,
                        principalSchema: "public",
                        principalTable: "Roles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TenantMembers_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalSchema: "public",
                        principalTable: "Tenants",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_TenantMembers_Users_UserId",
                        column: x => x.UserId,
                        principalSchema: "public",
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ApplicantDetails_BarangayId",
                schema: "public",
                table: "ApplicantDetails",
                column: "BarangayId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicantDetails_CompanyDetailId",
                schema: "public",
                table: "ApplicantDetails",
                column: "CompanyDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_Applicants_ApplicantDetailId",
                schema: "public",
                table: "Applicants",
                column: "ApplicantDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_Applicants_CompanyDetailId",
                schema: "public",
                table: "Applicants",
                column: "CompanyDetailId");

            migrationBuilder.CreateIndex(
                name: "IX_Applicants_TenantId",
                schema: "public",
                table: "Applicants",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Applicants_UserId",
                schema: "public",
                table: "Applicants",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationApplicants_ApplicantId",
                schema: "public",
                table: "ApplicationApplicants",
                column: "ApplicantId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationRequirements_ApplicantId",
                schema: "public",
                table: "ApplicationRequirements",
                column: "ApplicantId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationRequirements_ApplicationId",
                schema: "public",
                table: "ApplicationRequirements",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationRequirements_RequirementId",
                schema: "public",
                table: "ApplicationRequirements",
                column: "RequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationRequirements_ServiceVariantRequirementId",
                schema: "public",
                table: "ApplicationRequirements",
                column: "ServiceVariantRequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationRequirements_StoredFileId",
                schema: "public",
                table: "ApplicationRequirements",
                column: "StoredFileId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationRequirements_TenantId",
                schema: "public",
                table: "ApplicationRequirements",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_RegionId",
                schema: "public",
                table: "Applications",
                column: "RegionId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_ScheduleId",
                schema: "public",
                table: "Applications",
                column: "ScheduleId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_TenantId",
                schema: "public",
                table: "Applications",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Applications_UserId",
                schema: "public",
                table: "Applications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationServices_ApplicationId",
                schema: "public",
                table: "ApplicationServices",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationServices_ServiceCategoryId",
                schema: "public",
                table: "ApplicationServices",
                column: "ServiceCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationServices_ServiceId",
                schema: "public",
                table: "ApplicationServices",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationServices_ServiceVariantId",
                schema: "public",
                table: "ApplicationServices",
                column: "ServiceVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_ApplicationId",
                schema: "public",
                table: "ApplicationStatusHistories",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_ApplicationStatusHistories_UserId",
                schema: "public",
                table: "ApplicationStatusHistories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Barangays_Code",
                schema: "public",
                table: "Barangays",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Barangays_MunicipalityId",
                schema: "public",
                table: "Barangays",
                column: "MunicipalityId");

            migrationBuilder.CreateIndex(
                name: "IX_CompanyDetails_BarangayId",
                schema: "public",
                table: "CompanyDetails",
                column: "BarangayId");

            migrationBuilder.CreateIndex(
                name: "IX_ExaminationSchedules_ServiceId",
                schema: "public",
                table: "ExaminationSchedules",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Fees_Code",
                schema: "public",
                table: "Fees",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FieldOffices_OfficerInChargeId",
                schema: "public",
                table: "FieldOffices",
                column: "OfficerInChargeId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldOffices_ProvinceId",
                schema: "public",
                table: "FieldOffices",
                column: "ProvinceId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldOffices_RegionId",
                schema: "public",
                table: "FieldOffices",
                column: "RegionId");

            migrationBuilder.CreateIndex(
                name: "IX_FieldOffices_TenantId_Code",
                schema: "public",
                table: "FieldOffices",
                columns: new[] { "TenantId", "Code" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FormFieldValues_FieldId",
                schema: "public",
                table: "FormFieldValues",
                column: "FieldId");

            migrationBuilder.CreateIndex(
                name: "IX_Forms_ServiceId",
                schema: "public",
                table: "Forms",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_FormSections_FormId_Key",
                schema: "public",
                table: "FormSections",
                columns: new[] { "FormId", "Key" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_FormSubmissions_ApplicantId",
                schema: "public",
                table: "FormSubmissions",
                column: "ApplicantId");

            migrationBuilder.CreateIndex(
                name: "IX_FormSubmissions_ApplicationId",
                schema: "public",
                table: "FormSubmissions",
                column: "ApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_FormSubmissions_FormId",
                schema: "public",
                table: "FormSubmissions",
                column: "FormId");

            migrationBuilder.CreateIndex(
                name: "IX_Municipalities_Code",
                schema: "public",
                table: "Municipalities",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Municipalities_ProvinceId",
                schema: "public",
                table: "Municipalities",
                column: "ProvinceId");

            migrationBuilder.CreateIndex(
                name: "IX_Provinces_Code",
                schema: "public",
                table: "Provinces",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Provinces_RegionId",
                schema: "public",
                table: "Provinces",
                column: "RegionId");

            migrationBuilder.CreateIndex(
                name: "IX_Regions_Code",
                schema: "public",
                table: "Regions",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_RoleId_PermissionKey",
                schema: "public",
                table: "RolePermissions",
                columns: new[] { "RoleId", "PermissionKey" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Roles_TenantId",
                schema: "public",
                table: "Roles",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_ServiceId",
                schema: "public",
                table: "Schedules",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Schedules_TenantId",
                schema: "public",
                table: "Schedules",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_SectionFields_FieldId",
                schema: "public",
                table: "SectionFields",
                column: "FieldId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceCategories_Code",
                schema: "public",
                table: "ServiceCategories",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceFees_FeeId",
                schema: "public",
                table: "ServiceFees",
                column: "FeeId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceFees_ServiceId",
                schema: "public",
                table: "ServiceFees",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_Code",
                schema: "public",
                table: "Services",
                column: "Code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Services_ServiceCategoryId",
                schema: "public",
                table: "Services",
                column: "ServiceCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Services_TenantId",
                schema: "public",
                table: "Services",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceVariantRequirements_RequirementId",
                schema: "public",
                table: "ServiceVariantRequirements",
                column: "RequirementId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceVariantRequirements_ServiceVariantId",
                schema: "public",
                table: "ServiceVariantRequirements",
                column: "ServiceVariantId");

            migrationBuilder.CreateIndex(
                name: "IX_ServiceVariants_ServiceId",
                schema: "public",
                table: "ServiceVariants",
                column: "ServiceId");

            migrationBuilder.CreateIndex(
                name: "IX_StoredFiles_Category",
                schema: "public",
                table: "StoredFiles",
                column: "Category");

            migrationBuilder.CreateIndex(
                name: "IX_StoredFiles_StorageKey",
                schema: "public",
                table: "StoredFiles",
                column: "StorageKey",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_StoredFiles_TenantId",
                schema: "public",
                table: "StoredFiles",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_FieldOfficeId",
                schema: "public",
                table: "TenantMembers",
                column: "FieldOfficeId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_RoleId",
                schema: "public",
                table: "TenantMembers",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_TenantId_UserId",
                schema: "public",
                table: "TenantMembers",
                columns: new[] { "TenantId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_TenantMembers_UserId",
                schema: "public",
                table: "TenantMembers",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Tenants_RegionId",
                schema: "public",
                table: "Tenants",
                column: "RegionId");

            migrationBuilder.AddForeignKey(
                name: "FK_FieldOffices_TenantMembers_OfficerInChargeId",
                schema: "public",
                table: "FieldOffices",
                column: "OfficerInChargeId",
                principalSchema: "public",
                principalTable: "TenantMembers",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FieldOffices_Tenants_TenantId",
                schema: "public",
                table: "FieldOffices");

            migrationBuilder.DropForeignKey(
                name: "FK_Roles_Tenants_TenantId",
                schema: "public",
                table: "Roles");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantMembers_Tenants_TenantId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropForeignKey(
                name: "FK_TenantMembers_Users_UserId",
                schema: "public",
                table: "TenantMembers");

            migrationBuilder.DropForeignKey(
                name: "FK_FieldOffices_Regions_RegionId",
                schema: "public",
                table: "FieldOffices");

            migrationBuilder.DropForeignKey(
                name: "FK_Provinces_Regions_RegionId",
                schema: "public",
                table: "Provinces");

            migrationBuilder.DropForeignKey(
                name: "FK_FieldOffices_Provinces_ProvinceId",
                schema: "public",
                table: "FieldOffices");

            migrationBuilder.DropForeignKey(
                name: "FK_FieldOffices_TenantMembers_OfficerInChargeId",
                schema: "public",
                table: "FieldOffices");

            migrationBuilder.DropTable(
                name: "ActivityLogs",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ApplicationApplicants",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ApplicationRequirements",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ApplicationServices",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ApplicationStatusHistories",
                schema: "public");

            migrationBuilder.DropTable(
                name: "AuditLogs",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ExaminationSchedules",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Feedbacks",
                schema: "public");

            migrationBuilder.DropTable(
                name: "FormFieldValues",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Notes",
                schema: "public");

            migrationBuilder.DropTable(
                name: "RolePermissions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "SectionFields",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ServiceFees",
                schema: "public");

            migrationBuilder.DropTable(
                name: "SystemAnnouncements",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ServiceVariantRequirements",
                schema: "public");

            migrationBuilder.DropTable(
                name: "StoredFiles",
                schema: "public");

            migrationBuilder.DropTable(
                name: "FormSubmissions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Fields",
                schema: "public");

            migrationBuilder.DropTable(
                name: "FormSections",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Fees",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Requirements",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ServiceVariants",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Applicants",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Applications",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Forms",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ApplicantDetails",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Schedules",
                schema: "public");

            migrationBuilder.DropTable(
                name: "CompanyDetails",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Services",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Barangays",
                schema: "public");

            migrationBuilder.DropTable(
                name: "ServiceCategories",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Municipalities",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Tenants",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Users",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Regions",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Provinces",
                schema: "public");

            migrationBuilder.DropTable(
                name: "TenantMembers",
                schema: "public");

            migrationBuilder.DropTable(
                name: "FieldOffices",
                schema: "public");

            migrationBuilder.DropTable(
                name: "Roles",
                schema: "public");
        }
    }
}
